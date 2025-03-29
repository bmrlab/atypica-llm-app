import openai from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { appendStreamStepToUIMessage, fixChatMessages, streamStepsToUIMessage } from "@/lib/utils";
import { scoutSystem } from "@/prompt";
import { PlainTextToolResult } from "@/tools/utils";
import { InputJsonValue } from "@prisma/client/runtime/library";
import { waitUntil } from "@vercel/functions";
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
  studyUserChatId,
  // abortSignal, 因为是后台运行，abortSignal 不要传递下去
  statReport,
}: {
  studyUserChatId: number;
  abortSignal?: AbortSignal;
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
      const messages = await prepareMessagesForLLM(scoutUserChatId);
      if (messages.length) {
        messages.push({ id: generateId(), role: "user", content: "继续" });
      } else {
        messages.push({ id: generateId(), role: "user", content: description });
      }
      await scoutTaskChatStream({
        studyUserChatId,
        scoutUserChatId,
        messages,
        // abortSignal,
        statReport,
      });
      return {
        personas: [],
        plainText: "任务正在后台运行，请等待完成后再继续对话。",
      };
    },
  });

/**
 * 从数据库读取历史消息并修复一下
 */
async function prepareMessagesForLLM(scoutUserChatId: number) {
  const scoutUserChat = await prisma.userChat.findUniqueOrThrow({
    where: { id: scoutUserChatId, kind: "scout" },
  });
  let messages = scoutUserChat.messages as unknown as Message[];
  if (messages.length > 1 && messages[messages.length - 1].role === "user") {
    messages = messages.slice(0, -1);
  }
  return messages;
}

async function scoutTaskChatStream({
  studyUserChatId,
  scoutUserChatId,
  messages,
  // abortSignal,
  statReport,
}: {
  studyUserChatId: number;
  scoutUserChatId: number;
  messages: Message[];
  // abortSignal: AbortSignal;
  statReport: StatReporter;
}) {
  const abortController = new AbortController(); // 后台运行，自己控制 abort
  const abortSignal = abortController.signal;
  const backgroundToken = `ScoutUserChat:${scoutUserChatId}:${new Date().valueOf().toString()}`;

  try {
    // mark as running in background
    await prisma.userChat.updateMany({
      where: {
        OR: [
          { id: studyUserChatId, kind: "study" },
          { id: scoutUserChatId, kind: "scout" },
        ],
      },
      data: {
        backgroundToken,
      },
    });
  } catch (error) {
    console.log("Error updating backgroundToken:", error);
  }

  waitUntil(
    new Promise(async (resolve, reject) => {
      let stop = false;
      const start = Date.now();
      const tick = () => {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - start) / 1000);
        if (elapsedSeconds > 600) {
          console.log(`\n[${scoutUserChatId}] ScoutTask timeout\n`);
          stop = true;
          abortController.abort();
          reject(new Error(`[${scoutUserChatId}] ScoutTask background run timeout`));
        }
        if (stop) {
          console.log(`\n[${scoutUserChatId}] ScoutTask stopped\n`);
        } else {
          console.log(`\n[${scoutUserChatId}] ScoutTask is ongoing, ${elapsedSeconds} seconds`);
          setTimeout(() => tick(), 5000);
        }
      };
      tick();

      try {
        await backgroundRun({
          backgroundToken,
          studyUserChatId,
          scoutUserChatId,
          messages,
          abortSignal,
          statReport,
        });
        stop = true;
        resolve(null);
      } catch (error) {
        console.log(
          `[${scoutUserChatId}] ScoutTaskChat backgroundRun error:`,
          (error as Error).message,
        );
        stop = true;
        abortController.abort();
        reject(new Error(`[${scoutUserChatId}] ScoutTask background run aborted`));
      }

      try {
        // mark as background running end
        await prisma.userChat.updateMany({
          where: {
            OR: [
              { id: studyUserChatId, backgroundToken, kind: "study" },
              { id: scoutUserChatId, backgroundToken, kind: "scout" },
            ],
          },
          data: {
            backgroundToken: null,
          },
        });
      } catch (error) {
        console.log(
          `Error clearing background token with scoutUserChatId ${scoutUserChatId} studyUserChatId ${studyUserChatId} and backgroundToken ${backgroundToken}`,
          error,
        );
      }
    }).catch(() => {
      // 遇到错误不需要处理
    }),
  );
}

async function backgroundRun({
  backgroundToken,
  // studyUserChatId,
  scoutUserChatId,
  messages: _messages,
  abortSignal,
  statReport,
}: {
  backgroundToken: string;
  studyUserChatId: number;
  scoutUserChatId: number;
  messages: Message[];
  abortSignal: AbortSignal;
  statReport: StatReporter;
}): Promise<ScoutTaskChatResult["personas"]> {
  let messages = [..._messages];

  while (true) {
    const updateLastMessage = ((scoutUserChatId: number, initialMessages: Message[]) => {
      // 这里要保持之前的消息不变，不断更新最后一条消息的 parts，所以要在闭包里暂存 initialMessages
      return async (streamingMessage: Omit<Message, "role">) => {
        const messages: Message[] = [
          ...initialMessages,
          { role: "assistant", ...streamingMessage },
        ];
        await prisma.userChat.update({
          where: { id: scoutUserChatId, backgroundToken },
          data: { messages: messages as unknown as InputJsonValue },
        });
      };
    })(scoutUserChatId, messages);

    await new Promise<Omit<Message, "role">>(async (resolve, reject) => {
      const streamingMessage: Omit<Message, "role"> = {
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
        messages: fixChatMessages(messages, { removePendingTool: true }), // 传给 LLM 的时候需要修复
        tools: {
          [ToolName.reasoningThinking]: reasoningThinkingTool({ abortSignal, statReport }),
          [ToolName.xhsSearch]: xhsSearchTool,
          [ToolName.xhsUserNotes]: xhsUserNotesTool,
          [ToolName.xhsNoteComments]: xhsNoteCommentsTool,
          [ToolName.savePersona]: savePersonaTool({ scoutUserChatId, statReport }),
        },
        maxSteps: 15,
        // onChunk: (chunk) => console.log(`[${scoutUserChatId}] ScoutTaskChat:`, JSON.stringify(chunk).substring(0, 100)),
        onFinish: async ({ steps }) => {
          const message = streamStepsToUIMessage(steps);
          resolve(message);
          await statReport("steps", steps.length, {
            reportedBy: "scoutTaskChat tool",
            scoutUserChatId,
          });
        },
        onStepFinish: async (step) => {
          appendStreamStepToUIMessage(streamingMessage, step);
          if (step.usage.totalTokens > 0) {
            await statReport("tokens", step.usage.totalTokens, {
              reportedBy: "scoutTaskChat tool",
              scoutUserChatId,
            });
          }
          try {
            if (streamingMessage.parts?.length && streamingMessage.content.trim()) {
              await updateLastMessage(streamingMessage);
            }
          } catch (error) {
            console.log(`[${scoutUserChatId}] ScoutTaskChat updateLastMessage error:`);
            reject(
              new Error(
                `Error updating last message with scoutUserChatId ${scoutUserChatId} and token ${backgroundToken}, aborting streamText`,
              ),
            );
          }
        },
        onError: (error) => {
          console.log(`[${scoutUserChatId}] ScoutTaskChat streamText error:`, error);
          reject(error);
        },
        abortSignal,
      });
      try {
        await response.consumeStream();
      } catch (error) {
        console.log(
          `[${scoutUserChatId}] ScoutTaskChat consumeStream error:`,
          (error as Error).message,
        );
        reject(error);
      }
    });

    const personasResult = await prisma.persona.findMany({
      where: { scoutUserChatId },
      orderBy: { createdAt: "desc" },
    });

    if (personasResult.length < 5) {
      // 开始一轮新的搜索
      messages = await prepareMessagesForLLM(scoutUserChatId);
      messages.push({
        id: generateId(),
        role: "user",
        content: `目前总结了${personasResult.length}个personas，还不够5个，请继续`,
      });
      continue;
    }

    const personas = personasResult.map((persona) => ({
      id: persona.id,
      name: persona.name,
      tags: persona.tags as string[],
      prompt: persona.prompt,
    }));
    // personas 没用到
    return personas;
  }
}
