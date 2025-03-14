import { fetchPersonaById } from "@/data";
import { InterviewBackground } from "./InterviewBackground";
import { notFound } from "next/navigation";
import { fetchAnalystById } from "@/data";
import { prisma } from "@/lib/prisma";
import { AnalystInterview } from "@/data";

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ analystId: string; personaId: string }>;
}) {
  const paramsResolved = await params;
  const analystId = parseInt(paramsResolved.analystId);
  const personaId = parseInt(paramsResolved.personaId);

  const persona = await fetchPersonaById(personaId);
  if (!persona) {
    notFound();
  }
  const analyst = await fetchAnalystById(analystId);
  if (!analyst) {
    notFound();
  }

  const analystInterview = await prisma.analystInterview.upsert({
    where: {
      analystId_personaId: {
        analystId,
        personaId,
      },
    },
    create: {
      analystId,
      personaId,
      personaPrompt: "",
      interviewerPrompt: "",
      messages: [],
      conclusion: "",
    },
    update: {},
  });

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
