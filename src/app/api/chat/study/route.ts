import { authOptions } from "@/lib/auth";
import openai from "@/lib/openai";
import { fixChatMessages } from "@/lib/utils";
import { studySystem } from "@/prompt";
import tools from "@/tools";
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
      scoutTaskCreate: tools.scoutTaskCreate(userId),
      scoutTaskChat: tools.scoutTaskChat({ abortSignal: req.signal }),
      saveAnalystStudySummary: tools.saveAnalystStudySummary(),
      saveAnalyst: tools.saveAnalyst(userId, chatId),
      interview: tools.interview({ abortSignal: req.signal }),
      analystReport: tools.analystReport,
      reasoningThinking: tools.reasoningThinking,
      // xhsSearch: tools.xhsSearch,
      // xhsUserNotes: tools.xhsUserNotes,
      // xhsNoteComments: tools.xhsNoteComments,
    },
    maxSteps: 3,
    onError: async (error) => {
      console.log("Error occurred:", error);
    },
  });

  return result.toDataStreamResponse();
}
