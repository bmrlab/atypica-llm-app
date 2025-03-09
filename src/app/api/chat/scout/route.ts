import { createOpenAI } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { xhsSearch } from "@/tools/xiaohongshu/search";
import { xhsUserPosts } from "@/tools/xiaohongshu/userPosts";
import { reasoningThinking } from "@/tools/experts/reasoning";
import { z } from "zod";
import { PlainTextToolResult } from "@/tools/utils";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

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
      // return await processToolResponse(xhsSearch({ keyword }));
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
      // return await processToolResponse(xhsUserPosts({ userId }));
    },
  }),
  // weather: tool({
  //   description: "获取指定地点的天气（华氏度）",
  //   parameters: z.object({
  //     location: z.string().describe("The location to get the weather for"),
  //   }),
  //   execute: async ({ location }) => {
  //     const temperature = Math.round(Math.random() * (90 - 32) + 32);
  //     return {
  //       location,
  //       temperature,
  //     };
  //   },
  // }),
};

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    // model: openai("o3-mini"),
    model: openai("claude-3-7-sonnet"),
    system:
      "你的任务是利用提供的工具寻找符合要求的人设。开始之前，请先咨询专家意见。在寻找过程中，要不断思考并反思，大胆推翻之前的假设 - 这种思维方式值得鼓励。请记住要结合专家意见和搜索结果，反复验证和调整你的判断。",
    messages,
    tools,
    maxSteps: 2,
    onError: async (error) => {
      console.error("Error occurred:", error);
    },
  });

  return result.toDataStreamResponse();
}
