import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { AnalystDetail } from "./AnalystDetail";
import { fetchAnalystById, fetchAnalystInterviews } from "@/data";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AnalystPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const analystId = parseInt((await params).id);

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=/analyst/${analystId}`);
  }

  const analyst = await fetchAnalystById(analystId);
  if (!analyst) {
    notFound();
  }

  const interviews = await fetchAnalystInterviews(analystId);

  return <AnalystDetail analyst={analyst} interviews={interviews} />;
}
