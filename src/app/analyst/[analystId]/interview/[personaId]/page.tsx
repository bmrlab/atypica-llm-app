import { fetchPersonaById } from "@/app/personas/data";
import { Interview } from "./Interview";
import { notFound } from "next/navigation";
import { fetchAnalystById } from "@/app/analyst/data";

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ analystId: string; personaId: string }>;
}) {
  const { analystId, personaId } = await params;
  const persona = await fetchPersonaById(parseInt(personaId));
  if (!persona) {
    notFound();
  }
  const analyst = await fetchAnalystById(parseInt(analystId));
  if (!analyst) {
    notFound();
  }
  return <Interview analyst={analyst} persona={persona} />;
}
