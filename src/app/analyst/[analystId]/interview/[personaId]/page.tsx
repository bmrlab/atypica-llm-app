import { fetchPersonaById } from "@/app/personas/data";
import { Interview } from "./Interview";
import { notFound } from "next/navigation";
import { fetchAnalystById } from "@/app/analyst/data";
import { prisma } from "@/lib/prisma";

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
    <Interview
      analystInterviewId={analystInterview.id}
      analyst={analyst}
      persona={persona}
    />
  );
}
