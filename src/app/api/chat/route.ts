import { createOpenAI } from "@ai-sdk/openai";
import { streamText, tool } from "ai";
import { xhsSearch } from "@/tools/xiaohongshu/search";
import { xhsUserPosts } from "@/tools/xiaohongshu/userPosts";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    // model: openai("o3-mini"),
    model: openai("claude-3-7-sonnet"),
    messages,
    maxSteps: 30,
    tools: {
      xhsSearch: tool({
        description: "Search for notes on Xiaohongshu (小红书)",
        parameters: z.object({
          keyword: z.string().describe("Search keyword"),
        }),
        execute: async ({ keyword }) => {
          const result = await xhsSearch({ keyword });
          return result;
        },
      }),
      xhsUserPosts: tool({
        description: "Get posts from a specific user on Xiaohongshu (小红书)",
        parameters: z.object({
          userId: z.string().describe("The user ID to fetch posts from"),
        }),
        execute: async ({ userId }) => {
          const result = await xhsUserPosts({ userId });
          return result;
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
    },
    onError: async (error) => {
      console.error("Error occurred:", error);
    },
  });

  return result.toDataStreamResponse();
}
