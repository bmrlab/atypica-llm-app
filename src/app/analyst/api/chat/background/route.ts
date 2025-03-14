import { createOpenAI } from "@ai-sdk/openai";
import { Persona, Analyst, AnalystInterview } from "@/data";
import {
  generateId,
  generateText,
  GenerateTextResult,
  Message,
  ToolSet,
} from "ai";
import tools from "@/tools/tools";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

type ChatProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  messages: any[];
  persona: Persona;
  analyst: Analyst;
  analystInterviewId: number;
};

function generateTextToUIMessage<T extends ToolSet, O>(
  result: GenerateTextResult<T, O>,
): Omit<Message, "role"> {
  const parts: Message["parts"] = [];
  const contents = [];
  for (const step of result.steps) {
    if (step.stepType === "initial") {
      contents.push(step.text);
      parts.push({ type: "text", text: step.text });
    } else if (step.stepType === "continue") {
      contents.push(step.text);
      parts.push({ type: "text", text: step.text });
    } else if (step.stepType === "tool-result") {
      contents.push(step.text);
      for (const toolResult of step.toolResults) {
        console.log("toolResult", toolResult);
        parts.push({
          type: "tool-invocation",
          toolInvocation: {
            state: "result",
            toolName: toolResult.toolName,
            args: toolResult.args,
            result: toolResult.result,
            toolCallId: toolResult.toolCallId,
          },
        });
      }
      parts.push({ type: "text", text: step.text });
    }
  }
  return {
    id: generateId(),
    content: contents.join("\n"),
    parts,
  };
}

async function chatWithInterviewer({
  messages,
  analyst,
  analystInterviewId,
}: ChatProps) {
  const systemPrompt = `你是${analyst.role}，你将对用户进行访谈，主题是:
<topic>
${analyst.topic}
</topic>

<objectives>
- 与用户深入交流，挖掘他们对方的看法和背后的需求
- 交流之前把所有产品方案完整的和用户讲一遍
- 建立用户的消费者画像和人格特征
- 分析收集到的信息,给出专业评估
- 除此之外不要问和主题无关的问题
</objectives>

<interview_process>
1. 请倾听用户的自我介绍
2. 进行多轮提问,收集信息:
  - 对用户回答提出追问,挖掘深层需求
  - 询问具体使用场景和痛点
  - 了解其生活方式和消费习惯
  - 观察情绪反应和态度倾向
3. 适时请教专家寻求建议
4. 对用户行为和需求进行专业分析
</interview_process>

<output_requirements>
1. 结论部分:
  - 针对产品方案给出明确评估结论
  - 提出改进建议
2. 用户画像总结:
  - 人口统计特征
  - 消费行为和习惯
  - 生活方式和价值观
  - 需求偏好
3. 精彩对话摘录:
  - 突出能反映用户洞察的对话片段
  - 总结关键发现
</output_requirements>

<communication_principles>
- 保持开放和友好的态度
- 注意倾听,给予积极回应
- 避免诱导性问题
- 遇到关键信息及时确认理解
- 适度引导但不打断用户表达
- 不要超过2轮对话，每次提问不要超过100字
</communication_principles>

<closing_process>
1. 首先输出以下结束语:
"本次访谈结束，谢谢您的参与！"

2. 然后把总结保存到数据库:
- 访谈结论
- 用户画像总结
- 精彩对话摘录
</closing_process>
`;

  try {
    await prisma.analystInterview.update({
      where: { id: analystInterviewId },
      data: {
        interviewerPrompt: systemPrompt,
      },
    });
  } catch (error) {
    console.error("Error saving personaPrompt:", error);
  }

  const result = await generateText({
    // model: openai("o3-mini"),
    model: openai("claude-3-7-sonnet"),
    system: systemPrompt,
    messages,
    tools: {
      // reasoningThinking: tools.reasoningThinking,
      saveInterviewConclusion:
        tools.saveInterviewConclusion(analystInterviewId),
    },
    maxSteps: 2,
  });

  return result;
}

async function chatWithPersona({
  messages,
  persona,
  analystInterviewId,
}: ChatProps) {
  const systemPrompt = `${persona.prompt}

背景:
你正在接受一个访谈,需要回答采访者的问题。

沟通要求:
- 以受访者的身份回答问题
- 保持专业性的同时也要体现个性化的观点
- 适当分享一些个人经历和感受
- 可以引用具体案例来支撑观点
- 回答要言简意赅,每次不超过500字
- 回答问题前先用小红书搜索相关信息作为参考

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

  const result = await generateText({
    // model: openai("gpt-4o"),
    model: openai("claude-3-7-sonnet"),
    system: systemPrompt,
    messages, // useChat 和 api 通信的时候，自己维护的这个 messages 会在每次请求的时候去掉 id
    tools: {
      xhsSearch: tools.xhsSearch,
    },
    maxSteps: 2,
  });

  return result;
}

async function backgroundRun({
  analyst,
  persona,
  analystInterviewId,
}: Omit<ChatProps, "messages">) {
  const personaAgent: { messages: Message[] } = {
    messages: [
      {
        id: generateId(),
        role: "user",
        content: `你好，我是${analyst.role}，今天我想和您进行一次访谈，主题是：\n${analyst.topic}\n\n访谈开始之前，请您先自我介绍一下。`,
      },
    ],
  };
  const interviewer: { messages: Message[] } = {
    messages: [],
  };
  while (true) {
    const resultPersona = await chatWithPersona({
      messages: personaAgent.messages,
      persona,
      analyst,
      analystInterviewId,
    });
    const newPersonaMessage = generateTextToUIMessage(resultPersona);
    console.log("Persona:", newPersonaMessage.content, "\n");
    personaAgent.messages.push({
      ...newPersonaMessage,
      role: "assistant",
    });
    interviewer.messages.push({
      ...newPersonaMessage,
      role: "user",
    });
    const resultInterviewer = await chatWithInterviewer({
      messages: interviewer.messages,
      persona,
      analyst,
      analystInterviewId,
    });
    const newInterviewerMessage = generateTextToUIMessage(resultInterviewer);
    console.log("Interviewer:", newInterviewerMessage.content, "\n");
    interviewer.messages.push({
      ...newInterviewerMessage,
      role: "assistant",
    });
    personaAgent.messages.push({
      ...newInterviewerMessage,
      role: "user",
    });

    try {
      await prisma.analystInterview.update({
        where: { id: analystInterviewId },
        data: {
          messages: personaAgent.messages as AnalystInterview["messages"],
        },
      });
    } catch (error) {
      console.error("Error saving messages:", error);
    }

    if (
      newInterviewerMessage.content.includes("本次访谈结束，谢谢您的参与！")
    ) {
      break;
    }
  }
}

export async function POST(req: Request) {
  const { analyst, persona, analystInterviewId } = (await req.json()) as {
    analyst: Analyst;
    persona: Persona;
    analystInterviewId: number;
  };

  await backgroundRun({
    analyst,
    persona,
    analystInterviewId,
  });

  return NextResponse.json({ message: "POST request received" });
}
