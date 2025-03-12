import { fetchPersonaById } from "@/app/api/personas/[id]/route";
import { Interview } from "./Interview";
import { notFound } from "next/navigation";

async function getPersona(id: string) {
  const persona = await fetchPersonaById(id);
  return persona;
}

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const persona = await getPersona(id);
  if (!persona) {
    notFound();
  }
  return <Interview persona={persona} />;
}
