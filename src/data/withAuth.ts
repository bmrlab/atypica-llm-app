"use server";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import { Session } from "next-auth";

// Helper function to check authentication
export default async function withAuth<T>(
  action: (user: NonNullable<Session["user"]>) => Promise<T>,
): Promise<T> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin");
  }
  return action(session.user);
}
