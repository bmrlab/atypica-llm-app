import { fetchPersonaById } from "@/app/personas/data";
import { Interview } from "./Interview";
import { notFound } from "next/navigation";

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const persona = await fetchPersonaById(id);
  if (!persona) {
    notFound();
  }
  return <Interview persona={persona} />;
}
