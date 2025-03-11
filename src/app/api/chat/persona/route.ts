import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import tools from "@/tools/tools";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export async function POST(req: Request) {
  const { messages, persona } = await req.json();

  const result = streamText({
    model: openai("claude-3-7-sonnet"),
    system: `${persona}\n\n回答问题之前可以用小红书搜索一下相关信息`,
    messages,
    tools: {
      xhsSearch: tools.xhsSearch,
    },
    maxSteps: 2,
    onError: async (error) => {
      console.error("Error occurred:", error);
    },
  });

  return result.toDataStreamResponse();
}
