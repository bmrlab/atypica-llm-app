import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const analystId = parseInt((await params).id);
  const analyst = await prisma.analyst.findUnique({
    where: { id: analystId },
  });

  if (!analyst) {
    notFound();
  }

  // If no HTML report exists, return 404
  if (!analyst.report) {
    notFound();
  }

  // Return the HTML content directly with proper content type
  return new Response(analyst.report, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
