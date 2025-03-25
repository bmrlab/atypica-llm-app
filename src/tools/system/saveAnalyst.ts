import { prisma } from "@/lib/prisma";
import { tool } from "ai";
import { z } from "zod";
import { PlainTextToolResult } from "../utils";

export interface SaveAnalystToolResult extends PlainTextToolResult {
  analystId: number;
  plainText: string;
}

export const saveAnalystTool = (userId: number, studyUserChatId: number) =>
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
      const analystExisting = await prisma.analyst.findUnique({ where: { studyUserChatId } });
      if (analystExisting) {
        return {
          analystId: analystExisting.id,
          plainText: JSON.stringify({
            analystId: analystExisting.id,
            role: analystExisting.role,
            topic: analystExisting.topic,
            hint: "Analyst already exists for this study, returning existing one",
          }),
        };
      }
      const analyst = await prisma.analyst.upsert({
        where: { studyUserChatId },
        create: { role, topic, report: "", studySummary: "", studyUserChatId },
        update: {},
      });
      await prisma.userAnalyst.upsert({
        where: {
          userId_analystId: { userId, analystId: analyst.id },
        },
        create: { userId, analystId: analyst.id },
        update: {},
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

export interface SaveAnalystStudySummaryTool extends PlainTextToolResult {
  analystId: number;
  studySummary: string;
  plainText: string;
}

export const saveAnalystStudySummaryTool = () =>
  tool({
    description: "保存调研专家的研究总结",
    parameters: z.object({
      analystId: z.number().describe("调研主题的 ID"),
      studySummary: z.string().describe("调研专家的研究总结"),
    }),
    experimental_toToolResultContent: (result: PlainTextToolResult) => {
      return [{ type: "text", text: result.plainText }];
    },
    execute: async ({ analystId, studySummary }): Promise<SaveAnalystStudySummaryTool> => {
      const analyst = await prisma.analyst.update({
        where: { id: analystId },
        data: { studySummary },
      });
      return {
        analystId: analyst.id,
        studySummary: analyst.studySummary,
        plainText: JSON.stringify({
          analystId: analyst.id,
          studySummary: analyst.studySummary,
        }),
      };
    },
  });
