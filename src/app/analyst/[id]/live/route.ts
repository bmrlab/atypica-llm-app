import { authOptions } from "@/lib/auth";
import openai from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { reportHTMLPrologue, reportHTMLSystem } from "@/prompt";
import { streamText } from "ai";
import { getServerSession } from "next-auth/next";
import { forbidden, redirect } from "next/navigation";

const listenScript = (redirect: string) => `
<script>
  window.streamComplete = false;
  const observer = new MutationObserver((mutations) => {
    if (document.getElementById('stream-complete') && !window.streamComplete) {
      window.streamComplete = true;
      setTimeout(() => {
        window.location.href = '${redirect}';
      }, 2000);
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });
</script>
`;

const redirectNote = () => {
  // In a real implementation, we would get this text through i18n
  // Since route handlers don't have direct access to useTranslations, we'd need to pass the locale or use a different approach
  return `
<div id="stream-complete" style="display:none;"></div>
<div style="text-align:center; padding: 20px; margin-top: 30px;">
  <p>Report generation complete, redirecting to the report page...</p>
</div>
`;
};

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const url = new URL(req.url);
  const searchParams = Object.fromEntries(url.searchParams.entries());
  const regenerate = searchParams.regenerate == "1" ? true : false;
  const analystId = parseInt((await params).id);

  const analyst = await prisma.analyst.findUnique({
    where: { id: analystId },
    include: {
      interviews: {
        where: { conclusion: { not: "" } },
      },
    },
  });

  if (!analyst) {
    return new Response("Analyst not found", { status: 404 });
  }

  if (analyst.report && !regenerate) {
    redirect(`/analyst/${analystId}/html`);
  }

  // 只有没生成过报告的，才判断权限
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=/analyst/${analystId}/live`);
  }

  // @AUTHTODO: 读取 Live Report, 如果已经生成，就公开可读，如果还没生成，则需要权限
  const userAnalyst = await prisma.userAnalyst.findUnique({
    where: { userId_analystId: { userId: session.user.id, analystId } },
  });
  if (!userAnalyst) {
    // return new Response("Analyst not belong to user", { status: 403 });
    forbidden();
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
      controller.enqueue(listenScript(`/analyst/${analystId}/html`));
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
        controller.enqueue(redirectNote());
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
