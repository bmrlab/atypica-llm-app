import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const personas = await prisma.persona.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return NextResponse.json(personas);
}
