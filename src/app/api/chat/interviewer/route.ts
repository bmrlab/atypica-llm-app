import { Analyst } from "@/data";
import openai from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { interviewerSystem } from "@/prompt";
import { reasoningThinkingTool, saveInterviewConclusionTool, ToolName } from "@/tools";
import { streamText } from "ai";

export async function POST(req: Request) {
  const { messages, analyst, analystInterviewId } = (await req.json()) as {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    messages: any[];
    analyst: Analyst;
    analystInterviewId: number;
  };

  const systemPrompt = interviewerSystem(analyst);

  try {
    await prisma.analystInterview.update({
      where: { id: analystInterviewId },
      data: {
        interviewerPrompt: systemPrompt,
      },
    });
  } catch (error) {
    console.log("Error saving personaPrompt:", error);
  }

  const result = streamText({
    // model: openai("o3-mini"),
    model: openai("claude-3-7-sonnet"),
    providerOptions: {
      openai: { stream_options: { include_usage: true } },
    },
    system: systemPrompt,
    messages,
    tools: {
      [ToolName.reasoningThinking]: reasoningThinkingTool(),
      [ToolName.saveInterviewConclusion]: saveInterviewConclusionTool(analystInterviewId),
    },
    onError: async (error) => {
      console.log("Error occurred:", error);
    },
  });

  return result.toDataStreamResponse();
}
