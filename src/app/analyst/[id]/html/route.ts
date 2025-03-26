import { encryptAnalystReportUrl } from "@/app/analyst/report/encrypt";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const analystId = parseInt((await params).id);

  // 只有老的 report 支持，新的 report 不再支持这个方式访问
  if (analystId >= 240) {
    notFound();
  }

  const analyst = await prisma.analyst.findUnique({
    where: { id: analystId },
  });

  if (!analyst || !analyst.report) {
    notFound();
  }

  const publicReportUrl = await encryptAnalystReportUrl(analystId);
  redirect(publicReportUrl);
}
