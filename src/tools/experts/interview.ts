import { Analyst, Persona } from "@/data";
import openai from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { streamStepsToUIMessage } from "@/lib/utils";
import { interviewerPrologue, interviewerSystem, personaAgentSystem } from "@/prompt";
import tools from "@/tools";
import { PlainTextToolResult } from "@/tools/utils";
import { InputJsonValue } from "@prisma/client/runtime/library";
import { generateId, Message, streamText, tool } from "ai";
import { NextResponse } from "next/server";
import { z } from "zod";

export interface InterviewResult extends PlainTextToolResult {
  plainText: string;
}

export const interviewTool = tool({
  description: "对一个用户进行调研主题的访谈",
  parameters: z.object({
    analystId: z.number().describe("调研主题的 ID"),
    personaId: z.number().describe("调研对象的 ID"),
  }),
  experimental_toToolResultContent: (result: PlainTextToolResult) => {
    return [{ type: "text", text: result.plainText }];
  },
  execute: async ({ analystId, personaId }): Promise<InterviewResult> => {
    const [interview, persona, analyst] = await Promise.all([
      prisma.analystInterview.upsert({
        where: { analystId_personaId: { analystId, personaId } },
        update: {},
        create: {
          analystId,
          personaId,
          personaPrompt: "",
          interviewerPrompt: "",
          messages: [],
          conclusion: "",
        },
      }),
      prisma.persona.findUniqueOrThrow({ where: { id: personaId } }),
      prisma.analyst.findUniqueOrThrow({ where: { id: analystId } }),
    ]);
    try {
      await startInterview({
        analyst,
        persona: {
          ...persona,
          tags: persona.tags as string[],
        },
        analystInterviewId: interview.id,
      });
      return {
        plainText: JSON.stringify({
          analystId,
          personaId,
          result: "访谈结束",
        }),
      };
    } catch (error) {
      return {
        plainText: JSON.stringify({
          analystId,
          personaId,
          result: `访谈遇到问题 ${(error as Error).message}`,
        }),
      };
    }
  },
});

type ChatProps = {
  messages: Message[];
  persona: Persona;
  analyst: Analyst;
  analystInterviewId: number;
  interviewToken: string;
};

async function chatWithInterviewer({
  messages,
  analyst,
  analystInterviewId,
  interviewToken,
}: ChatProps) {
  const result = await new Promise<Omit<Message, "role">>(async (resolve, reject) => {
    const response = streamText({
      model: openai("claude-3-7-sonnet"),
      system: interviewerSystem(analyst),
      messages,
      tools: {
        // reasoningThinking: tools.reasoningThinking,
        saveInterviewConclusion: tools.saveInterviewConclusion(analystInterviewId, interviewToken),
      },
      onChunk: (chunk) =>
        console.log(`[${analystInterviewId}] Interviewer:`, JSON.stringify(chunk)),
      onFinish: ({ steps }) => {
        const message = streamStepsToUIMessage(steps);
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
  });
  return result;
}

async function chatWithPersona({
  messages,
  persona,
  analystInterviewId,
}: Omit<ChatProps, "interviewToken">) {
  const result = await new Promise<Omit<Message, "role">>(async (resolve, reject) => {
    const response = streamText({
      model: openai("gpt-4o"),
      system: personaAgentSystem(persona),
      messages,
      tools: {
        // xhsSearch: tools.xhsSearch,
      },
      maxSteps: 1,
      onChunk: (chunk) => console.log(`[${analystInterviewId}] Persona:`, JSON.stringify(chunk)),
      onFinish: ({ steps }) => {
        const message = streamStepsToUIMessage(steps);
        resolve(message);
      },
      onError: (error) => {
        console.log(error);
        reject(error);
      },
    });
    await response.consumeStream();
  });
  return result;
}

async function saveMessages({
  messages,
  analystInterviewId,
  interviewToken,
}: {
  messages: Message[];
  analystInterviewId: number;
  interviewToken: string;
}) {
  try {
    await prisma.analystInterview.update({
      where: {
        id: analystInterviewId,
        interviewToken,
      },
      data: {
        messages: messages as unknown as InputJsonValue,
      },
    });
  } catch (error) {
    console.log(
      `Error saving messages with interview id ${analystInterviewId} and token ${interviewToken}`,
      error,
    );
  }
}

async function backgroundRunInterview({
  analyst,
  persona,
  analystInterviewId,
  interviewToken,
}: Omit<ChatProps, "messages">) {
  const personaAgent: {
    messages: Message[];
  } = {
    messages: [{ id: generateId(), role: "user", content: interviewerPrologue(analyst) }],
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

    await saveMessages({
      messages: personaAgent.messages,
      analystInterviewId,
      interviewToken,
    });

    try {
      const message = await chatWithInterviewer({
        messages: interviewer.messages,
        persona,
        analyst,
        analystInterviewId,
        interviewToken,
      });
      console.log(`\n[${analystInterviewId}] Interviewer:\n${message.content}\n`);
      interviewer.messages.push({ ...message, role: "assistant" });
      personaAgent.messages.push({ ...message, role: "user" });
      if (message.content.includes("本次访谈结束，谢谢您的参与！")) {
        interviewer.terminated = true;
      }
    } catch (error) {
      console.log(`Error in Interviewer Agent: ${error}`);
      break;
    }

    await saveMessages({
      messages: personaAgent.messages,
      analystInterviewId,
      interviewToken,
    });

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

async function startInterview({
  analyst,
  persona,
  analystInterviewId,
}: {
  analyst: Analyst;
  persona: Persona;
  analystInterviewId: number;
}) {
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

  await new Promise(async (resolve, reject) => {
    let stop = false;
    const start = Date.now();
    const tick = () => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - start) / 1000);
      if (elapsedSeconds > 600) {
        console.log(`\n[${analystInterviewId}] Interview timeout\n`);
        stop = true;
        reject(new Error("Interview timeout"));
      }
      if (stop) {
        console.log(`\n[${analystInterviewId}] Interview stopped\n`);
      } else {
        console.log(`\n[${analystInterviewId}] Interview is ongoing, ${elapsedSeconds} seconds`);
        setTimeout(() => tick(), 5000);
      }
    };
    tick();

    await backgroundRunInterview({
      analyst,
      persona,
      analystInterviewId,
      interviewToken,
    });

    stop = true;
    resolve(null);
  });

  return NextResponse.json({ message: "POST request received" });
}
