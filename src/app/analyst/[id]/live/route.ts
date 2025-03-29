import { encryptAnalystReportUrl } from "@/app/analyst/report/encrypt";
import { authOptions } from "@/lib/auth";
import openai from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { reportHTMLPrologue, reportHTMLSystem } from "@/prompt";
import { initStatReporter } from "@/tools";
import { streamText } from "ai";
import { getServerSession } from "next-auth";
import { forbidden } from "next/navigation";

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

  // live route 需要登录，并需要权限
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    // redirect(`/auth/signin?callbackUrl=/analyst/${analystId}/live`);
    return new Response(null, {
      status: 307,
      headers: {
        Location: `/auth/signin?callbackUrl=/analyst/${analystId}/live`,
      },
    });
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
        where: { conclusion: { not: "" } },
      },
    },
  });
  if (!analyst) {
    return new Response("Analyst not found", { status: 404 });
  }

  const publicReportUrl = await encryptAnalystReportUrl(analystId);

  if (analyst.report && !regenerate) {
    // redirect(publicReportUrl);
    return new Response(null, {
      status: 308,
      headers: {
        Location: publicReportUrl,
      },
    });
  }

  const streamStartTime = Date.now();
  const { statReport } = analyst.studyUserChatId ? initStatReporter(analyst.studyUserChatId) : {};
  const result = streamText({
    model: openai("claude-3-7-sonnet"),
    providerOptions: {
      openai: { stream_options: { include_usage: true } },
    },
    system: reportHTMLSystem(""),
    messages: [
      {
        role: "user",
        content: reportHTMLPrologue(analyst),
      },
    ],
    maxSteps: 10,
    maxTokens: 100000,
    onFinish: async (result) => {
      await prisma.analyst.update({
        where: { id: analystId },
        data: { report: result.text },
      });
      if (result.usage.totalTokens > 0 && statReport) {
        const seconds = Math.floor((Date.now() - streamStartTime) / 1000);
        await Promise.all([
          statReport("tokens", result.usage.totalTokens, { reportedBy: "live report" }),
          statReport("duration", seconds, { reportedBy: "live report" }),
        ]);
      }
    },
    abortSignal: req.signal,
  });

  const reader = result.textStream.getReader();

  const readable = new ReadableStream({
    async start(controller) {
      controller.enqueue(listenScript(publicReportUrl));
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
