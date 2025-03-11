import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import tools from "@/tools";

const system = `你是Crocs的产品经理，正在给一款和哪吒联名的新款运动鞋命名。
你们正在考虑「风火飞轮」和「恨天高」这两个名字哪个更适合。
你将面对用户，听完用户的自我介绍以后，你需要对用户进行访谈，以获得答案。
访谈开始前和访谈过程中，你可以时不时的请教专家。
`;

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    // model: openai("o3-mini"),
    model: openai("claude-3-7-sonnet"),
    system,
    messages,
    tools: {
      reasoningThinking: tools.reasoningThinking,
    },
    maxSteps: 2,
    onError: async (error) => {
      console.error("Error occurred:", error);
    },
  });

  return result.toDataStreamResponse();
}
