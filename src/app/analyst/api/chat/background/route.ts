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
import {
  interviewerPrologue,
  interviewerSystem,
  personaAgentSystem,
} from "@/prompt";
import openai from "@/lib/openai";

type ChatProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  messages: any[];
  persona: Persona;
  analyst: Analyst;
  analystInterviewId: number;
  interviewToken: string;
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
}: Omit<ChatProps, "interviewToken">) {
  const result = await generateText({
    // model: openai("o3-mini"),
    model: openai("claude-3-7-sonnet"),
    system: interviewerSystem(analyst),
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
}: Omit<ChatProps, "interviewToken">) {
  const result = await generateText({
    // model: openai("gpt-4o"),
    model: openai("claude-3-7-sonnet"),
    system: personaAgentSystem(persona),
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
  interviewToken,
}: Omit<ChatProps, "messages">) {
  const personaAgent: { messages: Message[] } = {
    messages: [
      { id: generateId(), role: "user", content: interviewerPrologue(analyst) },
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
      const messages = personaAgent.messages as AnalystInterview["messages"];
      await prisma.analystInterview.update({
        where: {
          id: analystInterviewId,
          interviewToken,
        },
        data: { messages },
      });
    } catch (error) {
      console.error(
        `Error saving messages with interview id ${analystInterviewId} and token ${interviewToken}`,
        error,
      );
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

  const interviewToken = new Date().valueOf().toString();
  try {
    await prisma.analystInterview.update({
      where: { id: analystInterviewId },
      data: {
        personaPrompt: personaAgentSystem(persona),
        interviewerPrompt: interviewerSystem(analyst),
        messages: [],
        interviewToken,
      },
    });
  } catch (error) {
    console.error("Error saving prompts:", error);
  }

  backgroundRun({
    analyst,
    persona,
    analystInterviewId,
    interviewToken,
  });

  return NextResponse.json({ message: "POST request received" });
}
