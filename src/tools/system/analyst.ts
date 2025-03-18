import { prisma } from "@/lib/prisma";
import { tool } from "ai";
import { z } from "zod";
import { PlainTextToolResult } from "../utils";

export interface SaveAnalystToolResult extends PlainTextToolResult {
  id: number;
}

async function saveAnalyst({
  role,
  topic,
  userId,
}: {
  role: string;
  topic: string;
  userId: number;
}): Promise<SaveAnalystToolResult> {
  try {
    const analyst = await prisma.analyst.create({
      data: { role, topic, report: "" },
    });
    await prisma.userAnalyst.create({
      data: {
        userId: userId,
        analystId: analyst.id,
      },
    });
    return {
      id: analyst.id,
      plainText: `Saved analyst to DB with id ${analyst.id}`,
    };
  } catch (error) {
    console.log("Error saving analyst:", error);
    throw error;
  }
}

export const saveAnalystTool = (userId: number) =>
  tool({
    description: "保存 Analyst",
    parameters: z.object({
      role: z.string().describe("调研者的角色"),
      topic: z.string().describe("调研主题"),
    }),
    experimental_toToolResultContent: (result: PlainTextToolResult) => {
      return [{ type: "text", text: result.plainText }];
    },
    execute: async ({ role, topic }) => {
      const result = await saveAnalyst({
        role,
        topic,
        userId,
      });
      return result;
    },
  });
