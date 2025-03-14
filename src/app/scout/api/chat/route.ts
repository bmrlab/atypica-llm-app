import { streamText } from "ai";
import tools from "@/tools/tools";
import { scoutSystem } from "@/prompt";
import openai from "@/lib/openai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    // model: openai("o3-mini"),
    model: openai("claude-3-7-sonnet"),
    system: scoutSystem(),
    messages,
    tools: {
      reasoningThinking: tools.reasoningThinking,
      xhsSearch: tools.xhsSearch,
      xhsUserNotes: tools.xhsUserNotes,
      xhsNoteComments: tools.xhsNoteComments,
      savePersona: tools.savePersona,
    },
    maxSteps: 3,
    onError: async (error) => {
      console.error("Error occurred:", error);
    },
  });

  return result.toDataStreamResponse();
}
