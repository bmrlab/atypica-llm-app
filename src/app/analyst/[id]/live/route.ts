import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { forbidden, redirect } from "next/navigation";
import { streamText } from "ai";
import { prisma } from "@/lib/prisma";
import openai from "@/lib/openai";
import { reportHTMLPrologue, reportHTMLSystem } from "@/prompt";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const analystId = parseInt((await params).id);

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=/analyst/${analystId}/live`);
  }

  const userAnalyst = await prisma.userAnalyst.findUnique({
    where: { userId_analystId: { userId: session.user.id, analystId } },
  });
  if (!userAnalyst) {
    // return new Response("Analyst not belong to user", { status: 403 });
    forbidden();
  }

  const analyst = await prisma.analyst.findUnique({
    where: { id: analystId },
    include: {
      interviews: {
        where: {
          conclusion: {
            not: "",
          },
        },
      },
    },
  });

  if (!analyst) {
    return new Response("Analyst not found", { status: 404 });
  }

  const result = streamText({
    model: openai("claude-3-7-sonnet"),
    system: reportHTMLSystem(),
    messages: [
      {
        role: "user",
        content: reportHTMLPrologue(analyst),
      },
    ],
    maxSteps: 10,
    maxTokens: 100000,
    onFinish: async (message) => {
      await prisma.analyst.update({
        where: { id: analystId },
        data: { report: message.text },
      });
    },
  });

  const reader = result.textStream.getReader();

  const readable = new ReadableStream({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Transfer-Encoding": "chunked",
    },
  });
}
