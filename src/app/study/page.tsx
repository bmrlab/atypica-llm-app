import { fetchUserChatById } from "@/data";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { forbidden, notFound, redirect } from "next/navigation";
import { Metadata } from "next/types";
import { StudyPageClient } from "./StudyPageClient";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; replay?: string }>;
}): Promise<Metadata> {
  const id = (await searchParams).id;
  if (!id) {
    return {};
  }
  const chatId = parseInt(id);
  const userChat = await fetchUserChatById(chatId, "study");
  return userChat.title ? { title: userChat.title } : {};
}

export const dynamic = "force-dynamic";

export default async function StudyPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; replay?: string }>;
}) {
  const { id, replay } = await searchParams;
  if (!id) {
    redirect("/");
  }
  const chatId = parseInt(id);
  const userChat = await fetchUserChatById(chatId, "study");
  if (replay === "1") {
    if (userChat.token) {
      redirect(`/study/${userChat.token}/share?replay=1`);
    } else {
      notFound();
    }
  }

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/study");
  }
  if (userChat.userId !== session.user.id) {
    forbidden();
  }

  return <StudyPageClient studyChat={userChat} readOnly={false} replay={false} />;
}
