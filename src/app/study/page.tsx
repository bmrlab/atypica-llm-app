import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { StudyChat } from "./StudyChat";

export const dynamic = "force-dynamic";

export default async function StudyPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/study");
  }

  return <StudyChat />;
}
