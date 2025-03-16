import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { fetchAnalystInterviewById, fetchPersonaById } from "@/data";
import { InterviewBackground } from "./InterviewBackground";
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
  const persona = await fetchPersonaById(analystInterview.personaId);
  const analyst = await fetchAnalystById(analystInterview.analystId);

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
