import openai from "@/lib/openai";
import { fixChatMessages } from "@/lib/utils";
import { scoutSystem } from "@/prompt";
import {
  reasoningThinkingTool,
  savePersonaTool,
  ToolName,
  xhsNoteCommentsTool,
  xhsSearchTool,
  xhsUserNotesTool,
} from "@/tools";
import { Message, streamText } from "ai";

export async function POST(req: Request) {
  const payloadAwaited = await req.json();
  const messages = payloadAwaited["messages"] as Message[];
  const chatId = parseInt(payloadAwaited["chatId"]);
  const autoChat =
    typeof payloadAwaited["autoChat"] === "boolean" ? payloadAwaited["autoChat"] : false;

  const result = streamText({
    // model: openai("o3-mini"),
    model: openai("claude-3-7-sonnet"),
    system: scoutSystem({
      doNotStopUntilScouted: autoChat,
    }),
    messages: fixChatMessages(messages),
    tools: {
      [ToolName.reasoningThinking]: reasoningThinkingTool,
      [ToolName.xhsSearch]: xhsSearchTool,
      xhsUserNotes: xhsUserNotesTool,
      xhsNoteComments: xhsNoteCommentsTool,
      savePersona: savePersonaTool(chatId),
    },
    onError: async (error) => {
      console.log("Error occurred:", error);
    },
  });

  return result.toDataStreamResponse();
}
