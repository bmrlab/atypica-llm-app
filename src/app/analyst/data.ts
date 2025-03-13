import { prisma } from "@/lib/prisma";

export interface Analyst {
  id: number;
  role: string;
  topic: string;
  report: string;
}

export async function fetchAnalystById(id: number): Promise<Analyst | null> {
  try {
    const analyst = await prisma.analyst.findUnique({
      where: {
        id: id,
      },
    });
    if (!analyst) {
      return null;
    }
    return {
      id: analyst.id,
      role: analyst.role,
      topic: analyst.topic,
      report: analyst.report,
    };
  } catch (error) {
    console.error("Error fetching analyst:", error);
    return null;
  }
}
