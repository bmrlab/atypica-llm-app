import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ analystId: string; personaId: string }> },
) {
  const paramsResolved = await params;
  const analystId = parseInt(paramsResolved.analystId);
  const personaId = parseInt(paramsResolved.personaId);

  try {
    const interview = await prisma.analystInterview.upsert({
      where: {
        analystId_personaId: {
          analystId,
          personaId,
        },
      },
      update: {},
      create: {
        analystId,
        personaId,
        personaPrompt: "",
        interviewerPrompt: "",
        messages: [],
        conclusion: "",
      },
    });
    return NextResponse.json(interview);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // If unique constraint fails, it means the interview already exists
    if (error.code === "P2002") {
      return NextResponse.json({ message: "Interview already exists" });
    }
    return NextResponse.error();
  }
}
