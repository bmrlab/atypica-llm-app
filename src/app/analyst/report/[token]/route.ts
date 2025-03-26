import { decryptAnalystId } from "@/app/analyst/report/encrypt";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export async function GET(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const token = (await params).token;
  const analystId = await decryptAnalystId(token);

  const analyst = await prisma.analyst.findUnique({
    where: { id: analystId },
  });

  if (!analyst || !analyst.report) {
    notFound();
  }

  return new Response(analyst.report, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
