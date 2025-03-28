import { fetchUserChatById } from "@/data";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { forbidden, redirect } from "next/navigation";
import { Metadata } from "next/types";
import { StudyPageClient } from "./StudyPageClient";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}): Promise<Metadata> {
  const id = (await searchParams).id;
  if (!id) {
    return {};
  }
  const studyUserChatId = parseInt(id);
  const studyUserChat = await fetchUserChatById(studyUserChatId, "study");
  return studyUserChat.title ? { title: studyUserChat.title } : {};
}

export const dynamic = "force-dynamic";

export default async function StudyPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) {
    redirect("/");
  }
  const studyUserChatId = parseInt(id);
  const studyUserChat = await fetchUserChatById(studyUserChatId, "study");

  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin?callbackUrl=/study");
  }
  if (studyUserChat.userId !== session.user.id) {
    forbidden();
  }

  return <StudyPageClient studyUserChat={studyUserChat} readOnly={false} replay={false} />;
}
