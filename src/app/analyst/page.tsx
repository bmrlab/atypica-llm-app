import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AnalystsList } from "./AnalystsList";
import { fetchAnalysts } from "@/data";

export const dynamic = "force-dynamic";

export default async function AnalystsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/analyst");
  }

  const analysts = await fetchAnalysts();
  return <AnalystsList analysts={analysts} />;
}
