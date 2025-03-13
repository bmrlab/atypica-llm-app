import { createOpenAI } from "@ai-sdk/openai";
import { Message, streamText } from "ai";
import tools from "@/tools/tools";
import { Persona } from "@/data";
import { prisma } from "@/lib/prisma";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export async function POST(req: Request) {
  const { messages, persona, analystInterviewId } = (await req.json()) as {
    messages: Message[];
    persona: Persona;
    analystInterviewId: number;
  };

  const systemPrompt = `${persona.prompt}

背景:
你正在接受一个访谈,需要回答采访者的问题。

沟通要求:
- 以受访者的身份回答问题
- 保持专业性的同时也要体现个性化的观点
- 适当分享一些个人经历和感受
- 可以引用具体案例来支撑观点
- 回答要言简意赅,每次不超过100字
- 回答问题前可以先用小红书搜索相关信息作为参考

沟通原则:
- 少一些客套话,直接切入主题
- 表达要清晰自然,避免过于官方
- 适当表达情感,让回答更有温度
`;

  try {
    await prisma.analystInterview.update({
      where: { id: analystInterviewId },
      data: {
        personaPrompt: systemPrompt,
      },
    });
  } catch (error) {
    console.error("Error saving personaPrompt:", error);
  }

  const result = streamText({
    model: openai("gpt-4o"),
    // model: openai("claude-3-7-sonnet"),
    system: systemPrompt,
    messages, // useChat 和 api 通信的时候，自己维护的这个 messages 会在每次请求的时候去掉 id
    tools: {
      xhsSearch: tools.xhsSearch,
    },
    maxSteps: 2,
    onError: async (error) => {
      console.error("Error occurred:", error);
    },
    // 这里保存有问题，有时候 tool 的 result 是 experimental_toToolResultContent 的结果，没有 tool 返回的结果
    // onFinish: async (response) => {
    //   const finalMessages = appendResponseMessages({
    //     messages,
    //     responseMessages: response.response.messages,
    //   });
    //   await updateAnalystInterview(
    //     analystInterviewId,
    //     systemPrompt,
    //     finalMessages,
    //   );
    // },
  });

  return result.toDataStreamResponse();
}
