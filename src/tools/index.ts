import { tool } from "ai";
import { xhsSearch } from "@/tools/xiaohongshu/search";
import { xhsUserPosts } from "@/tools/xiaohongshu/userPosts";
import { reasoningThinking } from "@/tools/experts/reasoning";
import { z } from "zod";
import { PlainTextToolResult } from "@/tools/utils";

const tools = {
  reasoningThinking: tool({
    description: "针对特定话题或问题提供专家分析和逐步思考过程",
    parameters: z.object({
      query: z.string().describe("The question or topic to analyze"),
    }),
    experimental_toToolResultContent: (result: PlainTextToolResult) => {
      return [{ type: "text", text: result.plainText }];
    },
    execute: async ({ query }) => {
      const result = await reasoningThinking({ query });
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
  xhsUserPosts: tool({
    description: "获取小红书特定用户的帖子",
    parameters: z.object({
      userId: z.string().describe("The user ID to fetch posts from"),
    }),
    experimental_toToolResultContent: (result: PlainTextToolResult) => {
      return [{ type: "text", text: result.plainText }];
    },
    execute: async ({ userId }) => {
      const result = await xhsUserPosts({ userId });
      return result;
    },
  }),
};

export default tools;
