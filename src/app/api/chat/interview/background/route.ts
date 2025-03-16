import { waitUntil } from "@vercel/functions";
import { Persona, Analyst, AnalystInterview } from "@/data";
import { generateId, Message, StepResult, streamText, ToolSet } from "ai";
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
  messages: Message[];
  persona: Persona;
  analyst: Analyst;
  analystInterviewId: number;
  interviewToken: string;
};

function generateTextToUIMessage<T extends ToolSet>(
  steps: StepResult<T>[],
): Omit<Message, "role"> {
  const parts: Message["parts"] = [];
  const contents = [];
  for (const step of steps) {
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
  interviewToken,
}: ChatProps) {
  const result = await new Promise<Omit<Message, "role">>(
    async (resolve, reject) => {
      const response = streamText({
        model: openai("claude-3-7-sonnet"),
        system: interviewerSystem(analyst),
        messages,
        tools: {
          reasoningThinking: tools.reasoningThinking,
          saveInterviewConclusion: tools.saveInterviewConclusion(
            analystInterviewId,
            interviewToken,
          ),
        },
        maxSteps: 2,
        onChunk: (chunk) =>
          console.log(
            `[${analystInterviewId}] Interviewer:`,
            JSON.stringify(chunk),
          ),
        onFinish: ({ steps }) => {
          const message = generateTextToUIMessage(steps);
          resolve(message);
        },
        onError: (error) => {
          console.log(error);
          reject(error);
        },
      });
      await response.consumeStream();
      // 必须写这个 await，把 stream 消费完，也可以使用 consumeStream 方法
      // for await (const textPart of response.textStream) { console.log(textPart); }
    },
  );
  return result;
}

async function chatWithPersona({
  messages,
  persona,
  analystInterviewId,
}: Omit<ChatProps, "interviewToken">) {
  const result = await new Promise<Omit<Message, "role">>(
    async (resolve, reject) => {
      const response = streamText({
        model: openai("gpt-4o"),
        system: personaAgentSystem(persona),
        messages,
        tools: {
          xhsSearch: tools.xhsSearch,
        },
        maxSteps: 2,
        onChunk: (chunk) =>
          console.log(
            `[${analystInterviewId}] Persona:`,
            JSON.stringify(chunk),
          ),
        onFinish: ({ steps }) => {
          const message = generateTextToUIMessage(steps);
          resolve(message);
        },
        onError: (error) => {
          console.log(error);
          reject(error);
        },
      });
      await response.consumeStream();
    },
  );
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
  } = {
    messages: [
      { id: generateId(), role: "user", content: interviewerPrologue(analyst) },
    ],
  };

  const interviewer: {
    messages: Message[];
    terminated: boolean;
  } = {
    messages: [],
    terminated: false,
  };

  while (true) {
    try {
      const message = await chatWithPersona({
        messages: personaAgent.messages,
        persona,
        analyst,
        analystInterviewId,
      });
      console.log(`\n[${analystInterviewId}] Persona:\n${message.content}\n`);
      personaAgent.messages.push({ ...message, role: "assistant" });
      interviewer.messages.push({ ...message, role: "user" });
    } catch (error) {
      console.log(`Error in Persona Agent: ${error}`);
      break;
    }

    try {
      const message = await chatWithInterviewer({
        messages: interviewer.messages,
        persona,
        analyst,
        analystInterviewId,
        interviewToken,
      });
      console.log(
        `\n[${analystInterviewId}] Interviewer:\n${message.content}\n`,
      );
      interviewer.messages.push({ ...message, role: "assistant" });
      personaAgent.messages.push({ ...message, role: "user" });
      if (message.content.includes("本次访谈结束，谢谢您的参与！")) {
        interviewer.terminated = true;
      }
    } catch (error) {
      console.log(`Error in Interviewer Agent: ${error}`);
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
      console.log(
        `Error saving messages with interview id ${analystInterviewId} and token ${interviewToken}`,
        error,
      );
    }

    if (interviewer.terminated) {
      try {
        await prisma.analystInterview.update({
          where: { id: analystInterviewId, interviewToken },
          data: { interviewToken: null },
        });
      } catch (error) {
        console.log(
          `Error clearing interview token with interview id ${analystInterviewId} and token ${interviewToken}`,
          error,
        );
      }
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
    console.log("Error saving prompts:", error);
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
