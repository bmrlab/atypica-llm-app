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
  const scoutUserChatId = parseInt(payloadAwaited["scoutUserChatId"]);
  const autoChat =
    typeof payloadAwaited["autoChat"] === "boolean" ? payloadAwaited["autoChat"] : false;

  const result = streamText({
    // model: openai("o3-mini"),
    model: openai("claude-3-7-sonnet"),
    providerOptions: {
      openai: { stream_options: { include_usage: true } },
    },
    system: scoutSystem({
      doNotStopUntilScouted: autoChat,
    }),
    messages: fixChatMessages(messages), // 传给 LLM 的时候需要修复
    tools: {
      [ToolName.reasoningThinking]: reasoningThinkingTool(),
      [ToolName.xhsSearch]: xhsSearchTool,
      [ToolName.xhsUserNotes]: xhsUserNotesTool,
      [ToolName.xhsNoteComments]: xhsNoteCommentsTool,
      [ToolName.savePersona]: savePersonaTool({ scoutUserChatId }),
    },
    onError: async (error) => {
      console.log("Error occurred:", error);
    },
  });

  return result.toDataStreamResponse();
}
