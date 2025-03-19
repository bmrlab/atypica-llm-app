import { prisma } from "@/lib/prisma";
import { tool } from "ai";
import { z } from "zod";
import { PlainTextToolResult } from "../utils";

async function savePersona({
  name,
  source,
  tags,
  userids,
  personaPrompt,
  userChatId,
}: {
  name: string;
  source: string;
  tags: string[];
  userids: string[];
  personaPrompt: string;
  userChatId: number;
}) {
  try {
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
      id: persona.id,
      plainText: `Saved persona prompt to DB with id ${persona.id}`,
    };
  } catch (error) {
    console.log("Error saving persona:", error);
    throw error;
  }
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
    execute: async ({ name, source, tags, userids, personaPrompt }) => {
      const result = await savePersona({
        name,
        source,
        tags,
        userids,
        personaPrompt,
        userChatId,
      });
      return result;
    },
  });
