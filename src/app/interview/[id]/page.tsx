import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { fetchAnalystInterviewById, fetchPersonaById } from "@/data";
import { InterviewBackground } from "./InterviewBackground";
import { notFound } from "next/navigation";
import { fetchAnalystById } from "@/data";
import { AnalystInterview } from "@/data";

export const dynamic = "force-dynamic";

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = parseInt((await params).id);

  const session = await getServerSession(authOptions);
  if (!session) {
    redirect(`/auth/signin?callbackUrl=/interview/${id}`);
  }

  const analystInterview = await fetchAnalystInterviewById(id);
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
        ...analystInterview,
        messages: analystInterview.messages as AnalystInterview["messages"],
      }}
      analyst={analyst}
      persona={persona}
    />
  );
}
