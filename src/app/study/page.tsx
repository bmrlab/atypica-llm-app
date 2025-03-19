import { fetchUserChatById } from "@/data";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { forbidden, redirect } from "next/navigation";
import { StudyChat } from "./StudyChat";

export const dynamic = "force-dynamic";

export default async function StudyPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const idParam = (await searchParams)?.id;
  if (!idParam) {
    redirect("/");
  }
  const id = parseInt(idParam);

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/study");
  }

  const userChat = await fetchUserChatById(id, "study");
  if (userChat.userId !== session.user.id) {
    forbidden();
  }

  return <StudyChat studyChat={userChat} />;
}
