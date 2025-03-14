import { prisma } from "@/lib/prisma";

export async function saveInterviewConclusion({
  interviewId,
  interviewToken,
  conclusion,
}: {
  interviewId: number;
  interviewToken?: string;
  conclusion: string;
}) {
  try {
    await prisma.analystInterview.update({
      where: interviewToken
        ? { id: interviewId, interviewToken }
        : { id: interviewId },
      data: { conclusion },
    });
    console.log(
      `Saved interview conclusion to DB with id ${interviewId} token ${interviewToken}`,
    );
    return {
      id: interviewId,
      plainText: `Saved interview conclusion to DB with id ${interviewId}`,
    };
  } catch (error) {
    console.error(
      `Error saving interview conclusion to DB with id ${interviewId} token ${interviewToken}`,
      error,
    );
    return {
      id: null,
      plainText: `Error saving interview conclusion to DB`,
    };
  }
}
