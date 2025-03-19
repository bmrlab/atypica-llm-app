import openai from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { appendStreamStepToUIMessage, streamStepsToUIMessage } from "@/lib/utils";
import { scoutSystem } from "@/prompt";
import { PlainTextToolResult } from "@/tools/utils";
import { InputJsonValue } from "@prisma/client/runtime/library";
import { generateId, Message, streamText, tool } from "ai";
import { z } from "zod";
import tools from "..";

export interface ScoutTaskCreateResult extends PlainTextToolResult {
  chatId: number;
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
    execute: async ({ description }) => {
      const title = description.substring(0, 50);
      const message = { id: generateId(), role: "user", content: description };
      const userChat = await prisma.userChat.create({
        data: { userId, title, kind: "scout", messages: [message] },
      });
      return {
        chatId: userChat.id,
        plainText: `scoutTask created with ${userChat.id}`,
      };
    },
  });

export const scoutTaskChatTool = () =>
  tool({
    description: "开始执行用户画像搜索任务",
    parameters: z.object({
      chatId: z.number().describe("用户画像搜索任务 (scoutTask) 的 chatId"),
    }),
    experimental_toToolResultContent: (result: PlainTextToolResult) => {
      return [{ type: "text", text: result.plainText }];
    },
    execute: async ({ chatId }) => {
      return await scoutTaskChatStream(chatId);
    },
  });

async function scoutTaskChatStream(chatId: number): Promise<ScoutTaskChatResult> {
  const userChat = await prisma.userChat.findUniqueOrThrow({
    where: { id: chatId },
  });

  const saveToolMessages = (
    (chatId: number, initialMessages: Message[]) => async (message: Omit<Message, "role">) => {
      const messages: Message[] = [...initialMessages, { role: "assistant", ...message }];
      await prisma.userChat.update({
        where: { id: chatId },
        data: {
          messages: messages as unknown as InputJsonValue,
        },
      });
    }
  )(userChat.id, userChat.messages as unknown as Message[]);

  await new Promise<Omit<Message, "role">>(async (resolve, reject) => {
    const message: Omit<Message, "role"> = {
      id: generateId(),
      content: "",
      parts: [],
    };
    const response = streamText({
      model: openai("claude-3-7-sonnet"),
      system: scoutSystem({
        doNotStopUntilScouted: true,
      }),
      messages: userChat.messages as unknown as Message[],
      tools: {
        reasoningThinking: tools.reasoningThinking,
        xhsSearch: tools.xhsSearch,
        xhsUserNotes: tools.xhsUserNotes,
        xhsNoteComments: tools.xhsNoteComments,
        savePersona: tools.savePersona(chatId),
      },
      maxSteps: 30,
      onChunk: (chunk) => console.log(`[${chatId}] ScoutTaskChat:`, JSON.stringify(chunk)),
      onFinish: ({ steps }) => {
        const message = streamStepsToUIMessage(steps);
        resolve(message);
      },
      onStepFinish: (step) => {
        appendStreamStepToUIMessage(message, step);
        saveToolMessages(message);
      },
      onError: (error) => {
        console.log(error);
        reject(error);
      },
    });
    await response.consumeStream();
  });

  const personasResult = await prisma.persona.findMany({
    where: { userChatId: chatId },
    orderBy: {
      createdAt: "desc",
    },
  });

  const personas = personasResult.map((persona) => ({
    id: persona.id,
    name: persona.name,
    tags: persona.tags as string[],
  }));

  return {
    personas,
    plainText: JSON.stringify(personas),
  };
}
