import { createOpenAI } from "@ai-sdk/openai";
import { CoreMessage, Message, streamText } from "ai";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import tools from "@/tools/tools";
import { Persona } from "@/app/personas/data";
import { prisma } from "@/lib/prisma";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

const updateAnalystInterview = async (
  id: number,
  personaPrompt: string,
  messages: {
    role: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    content: any;
  }[],
) => {
  try {
    await prisma.analystInterview.update({
      where: { id },
      data: {
        personaPrompt,
        messages,
      },
    });
  } catch (error) {
    console.error("Error saving messages:", error);
  }
};

export async function POST(req: Request) {
  const { messages, persona, analystInterviewId } = (await req.json()) as {
    messages: CoreMessage[] | Omit<Message, "id">[];
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

  const result = streamText({
    model: openai("gpt-4o"),
    system: systemPrompt,
    messages,
    tools: {
      // xhsSearch: tools.xhsSearch,
    },
    maxSteps: 2,
    onError: async (error) => {
      console.error("Error occurred:", error);
    },
    onFinish: async (response) => {
      if (response.finishReason === "stop") {
        await updateAnalystInterview(analystInterviewId, systemPrompt, [
          ...messages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
          {
            role: "assistant",
            content: response.text,
          },
        ]);
      }
    },
  });

  return result.toDataStreamResponse();
}
