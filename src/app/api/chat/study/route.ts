import { authOptions } from "@/lib/auth";
import openai from "@/lib/openai";
import { fixChatMessages } from "@/lib/utils";
import { studySystem } from "@/prompt";
import {
  analystReportTool,
  interviewTool,
  reasoningThinkingTool,
  requestInteractionTool,
  saveAnalystStudySummaryTool,
  saveAnalystTool,
  scoutTaskChatTool,
  scoutTaskCreateTool,
  ToolName,
} from "@/tools";
import { Message, streamText } from "ai";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const payloadAwaited = await req.json();
  const chatId = parseInt(payloadAwaited["chatId"]);
  const messages = payloadAwaited["messages"] as Message[];

  const result = streamText({
    // model: openai("o3-mini"),
    model: openai("claude-3-7-sonnet"),
    system: studySystem(),
    messages: fixChatMessages(messages),
    tools: {
      [ToolName.scoutTaskCreate]: scoutTaskCreateTool(userId),
      [ToolName.scoutTaskChat]: scoutTaskChatTool({ abortSignal: req.signal }),
      [ToolName.saveAnalystStudySummary]: saveAnalystStudySummaryTool(),
      [ToolName.saveAnalyst]: saveAnalystTool(userId, chatId),
      [ToolName.interview]: interviewTool({ abortSignal: req.signal }),
      [ToolName.analystReport]: analystReportTool,
      [ToolName.reasoningThinking]: reasoningThinkingTool,
      [ToolName.requestInteraction]: requestInteractionTool,
      // [ToolName.xhsSearch]: xhsSearchTool,
      // [ToolName.xhsUserNotes]: xhsUserNotesTool,
      // [ToolName.xhsNoteComments]: xhsNoteCommentsTool,
    },
    maxSteps: 3,
    onError: async (error) => {
      console.log("Error occurred:", error);
    },
  });

  return result.toDataStreamResponse();
}
