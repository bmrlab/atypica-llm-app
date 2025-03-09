import { createOpenAI } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { xhsSearch } from "@/tools/xiaohongshu/search";
import { xhsUserPosts } from "@/tools/xiaohongshu/userPosts";
import { reasoningThinking } from "@/tools/experts/reasoning";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export interface PlainTextToolResult {
  plainText: string;
}

const tools = {
  reasoningThinking: tool({
    description:
      "Get expert analysis and step-by-step thinking on a topic or question",
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
    description: "Search for notes on Xiaohongshu (小红书)",
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
    description: "Get posts from a specific user on Xiaohongshu (小红书)",
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
  weather: tool({
    description: "Get the weather in a location (fahrenheit)",
    parameters: z.object({
      location: z.string().describe("The location to get the weather for"),
    }),
    execute: async ({ location }) => {
      const temperature = Math.round(Math.random() * (90 - 32) + 32);
      return {
        location,
        temperature,
      };
    },
  }),
};

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    // model: openai("o3-mini"),
    model: openai("claude-3-7-sonnet"),
    messages,
    // maxSteps: 30,
    tools,
    onError: async (error) => {
      console.error("Error occurred:", error);
    },
  });

  return result.toDataStreamResponse();
}
