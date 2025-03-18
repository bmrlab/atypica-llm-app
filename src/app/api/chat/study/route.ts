import { authOptions } from "@/lib/auth";
import openai from "@/lib/openai";
import { fixChatMessages } from "@/lib/utils";
import { studySystem } from "@/prompt";
import tools from "@/tools";
import { streamText } from "ai";
import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { messages } = await req.json();

  const result = streamText({
    // model: openai("o3-mini"),
    model: openai("claude-3-7-sonnet"),
    system: studySystem(),
    messages: fixChatMessages(messages),
    tools: {
      saveAnalyst: tools.saveAnalyst(userId),
      // reasoningThinking: tools.reasoningThinking,
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
