"use server";
import { prisma } from "@/lib/prisma";
import { UserChat as UserChatPrisma } from "@prisma/client";
import { InputJsonValue } from "@prisma/client/runtime/library";
import { Message } from "ai";
import { notFound } from "next/navigation";
import withAuth from "./withAuth";

export type UserChat = Omit<UserChatPrisma, "messages" | "kind"> & {
  kind: "scout" | "study" | "analyst" | "interview";
  messages: Message[];
};

export async function updateUserChat(chatId: number, messages: Message[]): Promise<UserChat> {
  if (messages.length < 2) {
    // AI 回复了再保存
    throw new Error("No messages provided");
  }
  return withAuth(async () => {
    try {
      const userChat = await prisma.userChat.update({
        where: { id: chatId },
        data: { messages: messages as unknown as InputJsonValue },
      });
      return {
        ...userChat,
        kind: userChat.kind as UserChat["kind"],
        messages: userChat.messages as unknown as Message[],
      };
    } catch (error) {
      console.log("Error creating user scout chat:", error);
      throw error;
    }
  });
}

export async function createUserChat(
  kind: UserChat["kind"],
  message: Pick<Message, "role" | "content">,
): Promise<UserChat> {
  return withAuth(async (user) => {
    try {
      const userChat = await prisma.userChat.create({
        data: {
          userId: user.id,
          title: message.content.substring(0, 50),
          kind,
          messages: [message],
        },
      });
      return {
        ...userChat,
        kind: userChat.kind as UserChat["kind"],
        messages: userChat.messages as unknown as Message[],
      };
    } catch (error) {
      console.log("Error creating user scout chat:", error);
      throw error;
    }
  });
}

export async function fetchUserChats(kind: UserChat["kind"]): Promise<UserChat[]> {
  return withAuth(async (user) => {
    try {
      const userChats = await prisma.userChat.findMany({
        where: {
          userId: user.id,
          kind,
        },
        orderBy: {
          createdAt: "desc",
        },
      });
      return userChats.map((chat) => {
        return {
          ...chat,
          kind: chat.kind as UserChat["kind"],
          messages: chat.messages as unknown as Message[],
        };
      });
    } catch (error) {
      console.log("Error fetching user scout chats:", error);
      throw error;
    }
  });
}

export async function fetchUserChatById(userChatId: number): Promise<UserChat> {
  return withAuth(async () => {
    try {
      const userChat = await prisma.userChat.findUnique({
        where: { id: userChatId },
      });
      if (!userChat) notFound();
      return {
        ...userChat,
        kind: userChat.kind as UserChat["kind"],
        messages: userChat.messages as unknown as Message[],
      };
    } catch (error) {
      console.log("Error fetching user scout chat:", error);
      throw error;
    }
  });
}
