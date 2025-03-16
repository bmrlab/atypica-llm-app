import { Message } from "ai";
import { AnalystInterview } from "@/data";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { messages, analystInterviewId } = (await req.json()) as {
    messages: Message[];
    analystInterviewId: number;
  };

  try {
    await prisma.analystInterview.update({
      where: { id: analystInterviewId },
      data: {
        messages: messages as AnalystInterview["messages"],
      },
    });
  } catch (error) {
    console.log("Error saving messages:", error);
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
