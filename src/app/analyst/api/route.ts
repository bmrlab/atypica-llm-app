import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (id) {
    const analyst = await prisma.analyst.findUnique({
      where: { id: parseInt(id) }
    });
    if (!analyst) {
      return NextResponse.json({ error: 'Analyst not found' }, { status: 404 });
    }
    return NextResponse.json(analyst);
  }

  const analysts = await prisma.analyst.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return NextResponse.json(analysts);
}

export async function POST(request: Request) {
  const json = await request.json();
  const analyst = await prisma.analyst.create({
    data: {
      role: json.role,
      topic: json.topic,
      report: "", // Empty report for new analysts
    },
  });
  return NextResponse.json(analyst);
}
