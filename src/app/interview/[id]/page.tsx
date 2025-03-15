import { fetchPersonaById } from "@/data";
import { InterviewBackground } from "./InterviewBackground";
import { notFound } from "next/navigation";
import { fetchAnalystById } from "@/data";
import { prisma } from "@/lib/prisma";
import { AnalystInterview } from "@/data";

export const dynamic = "force-dynamic";

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = parseInt((await params).id);

  const analystInterview = await prisma.analystInterview.findUnique({
    where: { id },
  });
  if (!analystInterview) {
    notFound();
  }

  const persona = await fetchPersonaById(analystInterview.personaId);
  if (!persona) {
    notFound();
  }

  const analyst = await fetchAnalystById(analystInterview.analystId);
  if (!analyst) {
    notFound();
  }

  return (
    <InterviewBackground
      analystInterview={{
        id: analystInterview.id,
        analystId: analystInterview.analystId,
        personaId: analystInterview.personaId,
        personaPrompt: analystInterview.personaPrompt,
        interviewerPrompt: analystInterview.interviewerPrompt,
        messages: analystInterview.messages as AnalystInterview["messages"],
        conclusion: analystInterview.conclusion,
        interviewToken: analystInterview.interviewToken,
      }}
      analyst={analyst}
      persona={persona}
    />
  );
}
