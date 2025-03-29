import { PlainTextToolResult } from "@/tools/utils";
import { tool } from "ai";
import { z } from "zod";

export interface RequestInteractionResult extends PlainTextToolResult {
  answer: string;
  plainText: string;
}

export const requestInteractionTool = tool({
  description: "向用户以选择题的形式提问以获得回复",
  parameters: z.object({
    question: z.string().describe("问题"),
    options: z.array(z.string()).describe("选项，最少2个，最多3个").default([]),
  }),
  experimental_toToolResultContent: (result: PlainTextToolResult) => {
    return [{ type: "text", text: result.plainText }];
  },
  // 不实现 execute, 让前端通过 addToolResult 方法来回复，AI SDK 这个功能很好用
  // execute: async ({ question, options }) => {
  //   return {
  //     question,
  //     options,
  //     plainText: "等待用户输入或选择答案", // 这样让 llm 知道可以停下来
  //   };
  // },
});
