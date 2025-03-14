import { waitUntil } from "@vercel/functions";
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
    model: openai("gpt-4o"),
    // model: openai("claude-3-7-sonnet"),
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
  const personaAgent: {
    messages: Message[];
    response?: Awaited<ReturnType<typeof chatWithPersona>>;
  } = {
    messages: [
      { id: generateId(), role: "user", content: interviewerPrologue(analyst) },
    ],
  };
  const interviewer: {
    messages: Message[];
    response?: Awaited<ReturnType<typeof chatWithInterviewer>>;
    terminated: boolean;
  } = {
    messages: [],
    terminated: false,
  };
  while (true) {
    try {
      personaAgent.response = await chatWithPersona({
        messages: personaAgent.messages,
        persona,
        analyst,
        analystInterviewId,
      });
      const message = generateTextToUIMessage(personaAgent.response);
      console.log(`\n[${analystInterviewId}] Persona:\n${message.content}\n`);
      personaAgent.messages.push({ ...message, role: "assistant" });
      interviewer.messages.push({ ...message, role: "user" });
    } catch (error) {
      console.error(`Error in Persona Agent: ${error}`);
      break;
    }

    try {
      interviewer.response = await chatWithInterviewer({
        messages: interviewer.messages,
        persona,
        analyst,
        analystInterviewId,
      });
      const message = generateTextToUIMessage(interviewer.response);
      console.log(
        `\n[${analystInterviewId}] Interviewer:\n${message.content}\n`,
      );
      interviewer.messages.push({ ...message, role: "assistant" });
      personaAgent.messages.push({ ...message, role: "user" });
      if (message.content.includes("本次访谈结束，谢谢您的参与！")) {
        interviewer.terminated = true;
      }
    } catch (error) {
      console.error(`Error in Interviewer Agent: ${error}`);
      break;
    }

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

    if (interviewer.terminated) {
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

  waitUntil(
    new Promise(async (resolve) => {
      let stop = false;
      const start = Date.now();
      const tick = () => {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - start) / 1000);
        if (elapsedSeconds > 600) {
          console.log(`\n[${analystInterviewId}] Interview timeout\n`);
          stop = true;
          resolve(null);
        }
        if (stop) {
          console.log(`\n[${analystInterviewId}] Interview stopped\n`);
        } else {
          console.log(
            `\n[${analystInterviewId}] Interview is ongoing, ${elapsedSeconds} seconds`,
          );
          setTimeout(() => tick(), 5000);
        }
      };
      tick();

      await backgroundRun({
        analyst,
        persona,
        analystInterviewId,
        interviewToken,
      });
      stop = true;
      resolve(null);
    }),
  );

  return NextResponse.json({ message: "POST request received" });
}
