import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { ScoutChat } from "./ScoutChat";

export const dynamic = "force-dynamic";

export default async function ScoutPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin?callbackUrl=/scout");
  }

  return <ScoutChat />;
}
