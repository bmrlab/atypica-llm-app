import { Message, streamText } from "ai";
import tools from "@/tools/tools";
import { scoutSystem } from "@/prompt";
import openai from "@/lib/openai";
import { fixChatMessages } from "@/lib/utils";

export async function POST(req: Request) {
  const { messages, chatId } = await req.json();

  const result = streamText({
    // model: openai("o3-mini"),
    model: openai("claude-3-7-sonnet"),
    system: scoutSystem(),
    messages: fixChatMessages(messages),
    tools: {
      reasoningThinking: tools.reasoningThinking,
      xhsSearch: tools.xhsSearch,
      xhsUserNotes: tools.xhsUserNotes,
      xhsNoteComments: tools.xhsNoteComments,
      savePersona: tools.savePersona(chatId),
    },
    maxSteps: 3,
    onError: async (error) => {
      console.log("Error occurred:", error);
    },
  });

  return result.toDataStreamResponse();
}
