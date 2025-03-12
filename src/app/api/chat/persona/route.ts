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
    system: `${persona}

背景:
你正在接受一个访谈,需要回答采访者的问题。

沟通要求:
- 以受访者的身份回答问题
- 保持专业性的同时也要体现个性化的观点
- 适当分享一些个人经历和感受
- 可以引用具体案例来支撑观点
- 回答要言简意赅,每次不超过500字
- 回答问题前可以先用小红书搜索相关信息作为参考

沟通原则:
- 少一些客套话,直接切入主题
- 表达要清晰自然,避免过于官方
- 适当表达情感,让回答更有温度
`,
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
