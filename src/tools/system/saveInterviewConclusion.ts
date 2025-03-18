import { prisma } from "@/lib/prisma";
import { tool } from "ai";
import { z } from "zod";
import { PlainTextToolResult } from "../utils";

async function saveInterviewConclusion({
  interviewId,
  interviewToken,
  conclusion,
}: {
  interviewId: number;
  interviewToken?: string;
  conclusion: string;
}) {
  try {
    await prisma.analystInterview.update({
      where: interviewToken ? { id: interviewId, interviewToken } : { id: interviewId },
      data: { conclusion },
    });
    console.log(`Saved interview conclusion to DB with id ${interviewId} token ${interviewToken}`);
    return {
      id: interviewId,
      plainText: `Saved interview conclusion to DB with id ${interviewId}`,
    };
  } catch (error) {
    console.log(
      `Error saving interview conclusion to DB with id ${interviewId} token ${interviewToken}`,
      error,
    );
    return {
      id: null,
      plainText: `Error saving interview conclusion to DB`,
    };
  }
}

export const saveInterviewConclusionTool = (interviewId: number, interviewToken?: string) =>
  tool({
    description: "将生成的结论保存到数据库",
    parameters: z.object({
      conclusion: z.string().describe("生成的结论"),
    }),
    experimental_toToolResultContent: (result: PlainTextToolResult) => {
      return [{ type: "text", text: result.plainText }];
    },
    execute: async ({ conclusion }) => {
      const result = await saveInterviewConclusion({
        interviewId,
        interviewToken,
        conclusion,
      });
      return result;
    },
  });
