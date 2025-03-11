import { tool } from "ai";
import { xhsSearch } from "@/tools/xiaohongshu/search";
import { xhsUserNotes } from "@/tools/xiaohongshu/userNotes";
import { reasoningThinking } from "@/tools/experts/reasoning";
import { z } from "zod";
import { PlainTextToolResult } from "@/tools/utils";
import { xhsNoteComments } from "./xiaohongshu/noteComments";

const tools = {
  reasoningThinking: tool({
    description: "针对特定话题或问题提供专家分析和逐步思考过程",
    parameters: z.object({
      contextSummary: z.string().describe("当前问题的上下文信息"),
      question: z.string().describe("问题或需要分析的主题"),
    }),
    experimental_toToolResultContent: (result: PlainTextToolResult) => {
      return [{ type: "text", text: result.plainText }];
    },
    execute: async ({ contextSummary, question }) => {
      const result = await reasoningThinking({ contextSummary, question });
      return result;
    },
  }),
  xhsSearch: tool({
    description: "在小红书上搜索笔记",
    parameters: z.object({
      keyword: z.string().describe("Search keyword"),
    }),
    // 这个方法返回的结果会发给 LLM 用来生成回复，只需要把 LLM 能够使用的文本给它就行，节省很多 tokens
    experimental_toToolResultContent: (result: PlainTextToolResult) => {
      return [{ type: "text", text: result.plainText }];
    },
    execute: async ({ keyword }) => {
      const result = await xhsSearch({ keyword });
      return result;
    },
  }),
  xhsUserNotes: tool({
    description: "获取小红书特定用户的帖子",
    parameters: z.object({
      userid: z.string().describe("The user ID to fetch notes from"),
    }),
    experimental_toToolResultContent: (result: PlainTextToolResult) => {
      return [{ type: "text", text: result.plainText }];
    },
    execute: async ({ userid }) => {
      const result = await xhsUserNotes({ userid });
      return result;
    },
  }),
  xhsNoteComments: tool({
    description: "获取小红书特定帖子的评论",
    parameters: z.object({
      noteid: z.string().describe("The note ID to fetch comments from"),
    }),
    experimental_toToolResultContent: (result: PlainTextToolResult) => {
      return [{ type: "text", text: result.plainText }];
    },
    execute: async ({ noteid }) => {
      const result = await xhsNoteComments({ noteid });
      return result;
    },
  }),
};

export default tools;
