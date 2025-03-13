import { prisma } from "@/lib/prisma";

export async function saveInterviewConclusion({
  interviewId,
  conclusion,
}: {
  interviewId: number;
  conclusion: string;
}) {
  try {
    const analystInterview = await prisma.analystInterview.update({
      where: { id: interviewId },
      data: { conclusion },
    });

    return {
      id: analystInterview.id,
      plainText: `Saved analyst report to DB with id ${analystInterview.id}`,
    };
  } catch (error) {
    console.error("Error saving analyst:", error);
    throw error;
  }
}
