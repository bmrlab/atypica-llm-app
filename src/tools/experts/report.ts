import { Analyst, AnalystReport } from "@/data";
import openai from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/utils";
import { reportHTMLPrologue, reportHTMLSystem } from "@/prompt";
import { reportCoverPrologue, reportCoverSystem } from "@/prompt/report";
import { PlainTextToolResult } from "@/tools/utils";
import { streamText, tool } from "ai";
import { z } from "zod";
import { StatReporter } from "..";

export interface GenerateReportResult extends PlainTextToolResult {
  analystId: number;
  reportId: number;
  plainText: string;
}

export const generateReportTool = ({
  abortSignal,
  statReport,
}: {
  abortSignal: AbortSignal;
  statReport: StatReporter;
}) =>
  tool({
    description: "为调研主题生成报告",
    parameters: z.object({
      analystId: z.number().describe("调研主题的 ID"),
      instruction: z.string().describe("用户指令，包括额外的报告内容和样式等").default(""),
      regenerate: z.boolean().describe("重新生成报告").default(false),
    }),
    experimental_toToolResultContent: (result: PlainTextToolResult) => {
      return [{ type: "text", text: result.plainText }];
    },
    execute: async ({ analystId, instruction, regenerate }): Promise<GenerateReportResult> => {
      let report = await prisma.analystReport.findFirst({
        where: { analystId },
        orderBy: { createdAt: "desc" },
      });
      if (report?.generatedAt && !regenerate) {
        return {
          analystId: analystId,
          reportId: report.id,
          plainText: `Report for analyst ${analystId} is generated`,
        };
      }
      if (report && !report.generatedAt) {
        // 复用这个没完成的 report
        report = await prisma.analystReport.update({
          where: { id: report.id },
          data: { onePageHtml: "" },
        });
      } else {
        const token = generateToken();
        report = await prisma.analystReport.create({
          data: { analystId, token, coverSvg: "", onePageHtml: "" },
        });
      }
      const analyst = await prisma.analyst.findUniqueOrThrow({
        where: { id: analystId },
        include: {
          interviews: {
            where: { conclusion: { not: "" } },
          },
        },
      });
      await generateReport({
        analyst,
        report,
        instruction,
        abortSignal,
        statReport,
      });
      // 更新一下 report 的数据
      report = await prisma.analystReport.findUniqueOrThrow({
        where: { id: report.id },
      });
      await generateCover({
        analyst,
        report,
        abortSignal,
        statReport,
      });
      return {
        analystId: analystId,
        reportId: report.id,
        plainText: `Report for analyst ${analystId} is generated`,
      };
    },
  });

async function generateReport({
  analyst,
  report,
  instruction,
  abortSignal,
  statReport,
}: {
  analyst: Analyst & {
    interviews: {
      conclusion: string;
    }[];
  };
  report: AnalystReport;
  instruction: string;
  abortSignal: AbortSignal;
  statReport: StatReporter;
}) {
  let onePageHtml = "";
  const response = streamText({
    model: openai("claude-3-7-sonnet"),
    providerOptions: {
      openai: { stream_options: { include_usage: true } },
    },
    system: reportHTMLSystem(instruction),
    messages: [{ role: "user", content: reportHTMLPrologue(analyst) }],
    maxSteps: 10,
    maxTokens: 100000,
    onChunk: async ({ chunk }) => {
      if (chunk.type === "text-delta") {
        onePageHtml += chunk.textDelta.toString();
        await prisma.analystReport.update({
          where: { id: report.id },
          data: { onePageHtml },
        });
      }
    },
    onFinish: async (result) => {
      await prisma.analystReport.update({
        where: { id: report.id },
        data: {
          onePageHtml: result.text,
          generatedAt: new Date(),
        },
      });
      if (result.usage.totalTokens > 0 && statReport) {
        await statReport("tokens", result.usage.totalTokens, {
          reportedBy: "generateReport tool",
          part: "onePageHtml",
        });
      }
    },
    abortSignal,
  });
  await response.consumeStream();
}

async function generateCover({
  analyst,
  report,
  abortSignal,
  statReport,
}: {
  analyst: Analyst;
  report: AnalystReport;
  abortSignal: AbortSignal;
  statReport: StatReporter;
}) {
  const response = streamText({
    model: openai("claude-3-7-sonnet"),
    providerOptions: {
      openai: { stream_options: { include_usage: true } },
    },
    system: reportCoverSystem(),
    messages: [{ role: "user", content: reportCoverPrologue(analyst, report) }],
    maxSteps: 3,
    maxTokens: 20000,
    onFinish: async (result) => {
      await prisma.analystReport.update({
        where: { id: report.id },
        data: {
          coverSvg: result.text,
        },
      });
      if (result.usage.totalTokens > 0 && statReport) {
        await statReport("tokens", result.usage.totalTokens, {
          reportedBy: "generateReport tool",
          part: "coverSvg",
        });
      }
    },
    abortSignal,
  });
  await response.consumeStream();
}
