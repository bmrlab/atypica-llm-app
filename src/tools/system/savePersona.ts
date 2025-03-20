import { prisma } from "@/lib/prisma";
import { tool } from "ai";
import { z } from "zod";
import { PlainTextToolResult } from "../utils";

export interface SaveAnalystToolResult extends PlainTextToolResult {
  personaId: number;
  plainText: string;
}

export const savePersonaTool = (userChatId: number) =>
  tool({
    description: "将生成的 persona prompt 保存到数据库",
    parameters: z.object({
      name: z
        .string()
        .describe("名字，不要包含姓氏，使用网名，名字前添加一个贴合人物特征的emoji表情符号"),
      source: z.string().describe("数据来源"),
      tags: z.array(z.string()).describe("相关标签"),
      userids: z.array(z.string()).describe("该人设典型的用户 ID 列表"),
      personaPrompt: z.string().describe("生成的 persona prompt 内容"),
    }),
    experimental_toToolResultContent: (result: PlainTextToolResult) => {
      return [{ type: "text", text: result.plainText }];
    },
    execute: async ({
      name,
      source,
      tags,
      userids,
      personaPrompt,
    }): Promise<SaveAnalystToolResult> => {
      const persona = await prisma.persona.create({
        data: {
          name,
          source,
          tags,
          samples: userids.map((id) => `https://www.xiaohongshu.com/user/profile/${id}`),
          prompt: personaPrompt,
          userChatId,
        },
      });
      return {
        personaId: persona.id,
        plainText: JSON.stringify({
          personaId: persona.id,
          name: persona.name,
          tags: persona.tags as string[],
        }),
      };
    },
  });
