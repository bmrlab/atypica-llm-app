import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { analystId, personaId } = (await req.json()) as {
    analystId: number;
    personaId: number;
  };
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const analystId = parseInt(searchParams.get("analystId") || "");
  const personaId = parseInt(searchParams.get("personaId") || "");

  try {
    const interview = await prisma.analystInterview.findUnique({
      where: {
        analystId_personaId: {
          analystId,
          personaId,
        },
      },
    });

    if (!interview) {
      return NextResponse.json(
        { message: "Interview not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(interview);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error retrieving interview" },
      { status: 500 },
    );
  }
}
