import { AnalystDetail } from "./AnalystDetail";
import { fetchAnalystById, fetchAnalystInterviews } from "@/data";
import { notFound } from "next/navigation";

export default async function AnalystPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const analystId = parseInt((await params).id);
  const analyst = await fetchAnalystById(analystId);

  if (!analyst) {
    notFound();
  }

  const interviews = await fetchAnalystInterviews(analystId);

  return <AnalystDetail analyst={analyst} interviews={interviews} />;
}
