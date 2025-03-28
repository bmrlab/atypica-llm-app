import openai from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { appendStreamStepToUIMessage, fixChatMessages, streamStepsToUIMessage } from "@/lib/utils";
import { scoutSystem } from "@/prompt";
import { PlainTextToolResult } from "@/tools/utils";
import { InputJsonValue } from "@prisma/client/runtime/library";
import { generateId, Message, streamText, tool } from "ai";
import { z } from "zod";
import { StatReporter, ToolName } from "..";
import { savePersonaTool } from "../system/savePersona";
import { xhsNoteCommentsTool } from "../xhs/noteComments";
import { xhsSearchTool } from "../xhs/search";
import { xhsUserNotesTool } from "../xhs/userNotes";
import { reasoningThinkingTool } from "./reasoning";

export interface ScoutTaskCreateResult extends PlainTextToolResult {
  scoutUserChatId: number;
  title: string;
  plainText: string;
}

export interface ScoutTaskChatResult extends PlainTextToolResult {
  personas: {
    id: number;
    name: string;
    tags: string[];
  }[];
  plainText: string;
}

export const scoutTaskCreateTool = (userId: number) =>
  tool({
    description: "创建一个用户画像搜索任务",
    parameters: z.object({
      description: z.string().describe('用户画像搜索需求描述，用"帮我寻找"开头'),
    }),
    experimental_toToolResultContent: (result: PlainTextToolResult) => {
      return [{ type: "text", text: result.plainText }];
    },
    execute: async ({ description }): Promise<ScoutTaskCreateResult> => {
      const title = description.substring(0, 50);
      const scoutUserChat = await prisma.userChat.create({
        data: { userId, title, kind: "scout", messages: [] },
      });
      return {
        scoutUserChatId: scoutUserChat.id,
        title: scoutUserChat.title,
        plainText: JSON.stringify({
          scoutUserChatId: scoutUserChat.id,
          title: scoutUserChat.title,
        }),
      };
    },
  });

export const scoutTaskChatTool = ({
  abortSignal,
  statReport,
}: {
  abortSignal: AbortSignal;
  statReport: StatReporter;
}) =>
  tool({
    description: "开始执行用户画像搜索任务",
    parameters: z.object({
      scoutUserChatId: z.number().describe("用户画像搜索任务 (scoutTask) 的 id"),
      description: z.string().describe('用户画像搜索需求描述，用"帮我寻找"开头'),
    }),
    experimental_toToolResultContent: (result: PlainTextToolResult) => {
      return [{ type: "text", text: result.plainText }];
    },
    execute: async ({ scoutUserChatId, description }) => {
      const messages = await prepareMessagesForLLM(scoutUserChatId, description);
      return await scoutTaskChatStream({ scoutUserChatId, messages, abortSignal, statReport });
    },
  });

/**
 * 从数据库读取历史消息，并追加一条最新的用户消息
 */
async function prepareMessagesForLLM(scoutUserChatId: number, content: string) {
  const scoutUserChat = await prisma.userChat.findUniqueOrThrow({
    where: { id: scoutUserChatId, kind: "scout" },
  });
  let messages = fixChatMessages(scoutUserChat.messages as unknown as Message[]);
  if (messages.length > 1 && messages[messages.length - 1].role === "user") {
    messages = messages.slice(0, -1);
  }
  messages.push({ id: generateId(), role: "user", content });
  return messages;
}

async function scoutTaskChatStream({
  scoutUserChatId,
  messages: _messages,
  abortSignal,
  statReport,
}: {
  scoutUserChatId: number;
  messages: Message[];
  abortSignal: AbortSignal;
  statReport: StatReporter;
}): Promise<ScoutTaskChatResult> {
  let messages = [..._messages];

  while (true) {
    const saveToolMessages = ((scoutUserChatId: number, initialMessages: Message[]) => {
      // 这里要保持上一条消息不变，不断更新最后一条消息的 parts，所以要在闭包里暂存 initialMessages
      return async (message: Omit<Message, "role">) => {
        const messages: Message[] = [...initialMessages, { role: "assistant", ...message }];
        await prisma.userChat.update({
          where: { id: scoutUserChatId },
          data: {
            messages: messages as unknown as InputJsonValue,
          },
        });
      };
    })(scoutUserChatId, messages);

    await new Promise<Omit<Message, "role">>(async (resolve, reject) => {
      const message: Omit<Message, "role"> = {
        id: generateId(),
        content: "",
        parts: [],
      };
      const response = streamText({
        model: openai("claude-3-7-sonnet"),
        providerOptions: {
          openai: { stream_options: { include_usage: true } },
        },
        system: scoutSystem({
          doNotStopUntilScouted: false, // 不需要，下面自己会处理 continue
        }),
        messages: fixChatMessages(messages as unknown as Message[]), // 传给 LLM 的时候需要修复
        tools: {
          [ToolName.reasoningThinking]: reasoningThinkingTool({ abortSignal, statReport }),
          [ToolName.xhsSearch]: xhsSearchTool,
          [ToolName.xhsUserNotes]: xhsUserNotesTool,
          [ToolName.xhsNoteComments]: xhsNoteCommentsTool,
          [ToolName.savePersona]: savePersonaTool({ scoutUserChatId, statReport }),
        },
        maxSteps: 15,
        onChunk: (chunk) =>
          console.log(`[${scoutUserChatId}] ScoutTaskChat:`, JSON.stringify(chunk)),
        onFinish: async ({ steps }) => {
          const message = streamStepsToUIMessage(steps);
          resolve(message);
          await statReport("steps", steps.length, {
            reportedBy: "scoutTaskChat tool",
            scoutUserChatId,
          });
        },
        onStepFinish: async (step) => {
          appendStreamStepToUIMessage(message, step);
          if (message.parts?.length && message.content.trim()) {
            await saveToolMessages(message);
          }
          if (step.usage.totalTokens > 0) {
            await statReport("tokens", step.usage.totalTokens, {
              reportedBy: "scoutTaskChat tool",
              scoutUserChatId,
            });
          }
        },
        onError: (error) => {
          console.log(error);
          reject(error);
        },
        abortSignal,
      });
      await response.consumeStream();
    });

    const personasResult = await prisma.persona.findMany({
      where: { scoutUserChatId },
      orderBy: { createdAt: "desc" },
    });

    if (personasResult.length < 5) {
      // 开始一轮新的搜索
      messages = await prepareMessagesForLLM(scoutUserChatId, "目前总结的personas还不够，请继续");
      continue;
    }

    const personas = personasResult.map((persona) => ({
      id: persona.id,
      name: persona.name,
      tags: persona.tags as string[],
      prompt: persona.prompt,
    }));

    return {
      personas,
      plainText: JSON.stringify(personas),
    };
  }
}
