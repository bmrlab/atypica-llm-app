import { StudyPageClient } from "@/app/study/StudyPageClient";
import { fetchUserChatByToken } from "@/data";
import { notFound, redirect } from "next/navigation";
import { Metadata } from "next/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const token = (await params).token;
  if (!token) {
    return {};
  }
  const studyUserChat = await fetchUserChatByToken(token, "study");
  return studyUserChat.title ? { title: studyUserChat.title } : {};
}

export const dynamic = "force-dynamic";

export default async function StudyPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ id?: string; replay?: string }>;
}) {
  const { token } = await params;
  const { replay } = await searchParams;
  if (!token) {
    notFound();
  }
  if (replay !== "1") {
    redirect(`/study/${token}/share?replay=1`);
  }
  const studyUserChat = await fetchUserChatByToken(token, "study");
  return <StudyPageClient studyUserChat={studyUserChat} readOnly={true} replay={true} />;
}
