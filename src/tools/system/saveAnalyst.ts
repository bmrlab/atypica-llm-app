import { prisma } from "@/lib/prisma";
import { tool } from "ai";
import { z } from "zod";
import { PlainTextToolResult } from "../utils";

export interface SaveAnalystToolResult extends PlainTextToolResult {
  analystId: number;
  plainText: string;
}

export const saveAnalystTool = (userId: number) =>
  tool({
    description: "保存调研主题",
    parameters: z.object({
      role: z.string().describe("调研者的角色"),
      topic: z.string().describe("调研主题"),
    }),
    experimental_toToolResultContent: (result: PlainTextToolResult) => {
      return [{ type: "text", text: result.plainText }];
    },
    execute: async ({ role, topic }): Promise<SaveAnalystToolResult> => {
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
        analystId: analyst.id,
        plainText: JSON.stringify({
          analystId: analyst.id,
          role: analyst.role,
          topic: analyst.topic,
        }),
      };
    },
  });
