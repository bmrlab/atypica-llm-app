import { prisma } from "@/lib/prisma";
import { PlainTextToolResult } from "@/tools/utils";
import { tool } from "ai";
import { z } from "zod";

export interface AnalystReportResult extends PlainTextToolResult {
  analystId: number;
  plainText: string;
}

export const analystReportTool = tool({
  description: "为调研主题生成报告",
  parameters: z.object({
    analystId: z.number().describe("调研主题的 ID"),
    regenerate: z.boolean().describe("重新生成报告").default(false),
  }),
  experimental_toToolResultContent: (result: PlainTextToolResult) => {
    return [{ type: "text", text: result.plainText }];
  },
  execute: async ({ analystId, regenerate }): Promise<AnalystReportResult> => {
    const analyst = regenerate
      ? await prisma.analyst.update({
          where: { id: analystId },
          data: { report: "" },
        })
      : await prisma.analyst.findUniqueOrThrow({
          where: { id: analystId },
        });
    if (analyst.report) {
      return {
        analystId: analyst.id,
        plainText: `Report for analyst ${analyst.id} is generated`,
        // 如果已经生成，也可以直接访问 live，会自动跳转
      };
    } else {
      return {
        analystId: analyst.id,
        plainText: `Report for analyst ${analyst.id} is generated`,
        // 文本是一样的，都叫 generated，不然 study agent 会认为 report 还在生成中，会重复发起生成
      };
    }
  },
});
