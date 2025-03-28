"use server";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/utils";
import { UserChat as UserChatPrisma } from "@prisma/client";
import { InputJsonValue } from "@prisma/client/runtime/library";
import { generateId, Message } from "ai";
import { forbidden, notFound } from "next/navigation";
import withAuth from "./withAuth";

export type UserChat = Omit<UserChatPrisma, "messages" | "kind"> & {
  kind: "scout" | "study" | "analyst" | "interview";
  messages: Message[];
};

export type ScoutUserChat = Omit<UserChat, "kind"> & {
  kind: "scout";
};

export type StudyUserChat = Omit<UserChat, "kind"> & {
  kind: "study";
};

export async function updateUserChat(chatId: number, messages: Message[]): Promise<UserChat> {
  if (messages.length < 2) {
    // AI 回复了再保存
    throw new Error("No messages provided");
  }
  return withAuth(async (user) => {
    try {
      const userChat = await prisma.userChat.update({
        where: {
          id: chatId,
          userId: user.id,
        },
        data: { messages: messages as unknown as InputJsonValue },
      });
      return {
        ...userChat,
        kind: userChat.kind as UserChat["kind"],
        messages: userChat.messages as unknown as Message[],
      };
    } catch (error) {
      console.log("Error updating user scout chat:", error);
      throw error;
    }
  });
}

export async function createUserChat<TKind extends UserChat["kind"]>(
  kind: TKind,
  message: Pick<Message, "role" | "content">,
): Promise<Omit<UserChat, "kind"> & { kind: TKind }> {
  return withAuth(async (user) => {
    try {
      const userChat = await prisma.userChat.create({
        data: {
          userId: user.id,
          title: message.content.substring(0, 50),
          kind,
          messages: [
            {
              id: generateId(),
              ...message,
            },
          ],
        },
      });
      return {
        ...userChat,
        kind: userChat.kind as TKind,
        messages: userChat.messages as unknown as Message[],
      };
    } catch (error) {
      console.log("Error creating user scout chat:", error);
      throw error;
    }
  });
}

export async function fetchUserChats<Tkind extends UserChat["kind"]>(
  kind: Tkind,
  { take = 30 }: { take?: number } = {},
): Promise<
  (Omit<UserChat, "kind" | "messages"> & {
    kind: Tkind;
  })[]
> {
  return withAuth(async (user) => {
    try {
      const userChats = await prisma.userChat.findMany({
        where: {
          userId: user.id,
          kind,
        },
        orderBy: {
          updatedAt: "desc",
        },
        select: {
          id: true,
          token: true,
          userId: true,
          title: true,
          kind: true,
          createdAt: true,
          updatedAt: true,
          messages: false,
        },
        take,
      });
      return userChats.map((chat) => {
        return {
          ...chat,
          kind: chat.kind as Tkind,
        };
      });
    } catch (error) {
      console.log("Error fetching user scout chats:", error);
      throw error;
    }
  });
}

export async function fetchUserChatById<Tkind extends UserChat["kind"]>(
  userChatId: number,
  kind: Tkind,
): Promise<
  Omit<UserChat, "kind"> & {
    kind: Tkind;
  }
> {
  // @AUTHTODO: 现在读取 UserChat 没有判断权限
  // return withAuth(async () => {
  try {
    const userChat = await prisma.userChat.findUnique({
      where: { id: userChatId, kind },
    });
    if (!userChat) notFound();
    return {
      ...userChat,
      kind: userChat.kind as Tkind,
      messages: userChat.messages as unknown as Message[],
    };
  } catch (error) {
    console.log("Error fetching user scout chat:", error);
    throw error;
  }
  // });
}

export async function fetchUserChatByToken<Tkind extends UserChat["kind"]>(
  token: string,
  kind: Tkind,
): Promise<
  Omit<UserChat, "kind"> & {
    kind: Tkind;
  }
> {
  try {
    const userChat = await prisma.userChat.findUnique({
      where: { token, kind },
    });
    if (!userChat) notFound();
    return {
      ...userChat,
      kind: userChat.kind as Tkind,
      messages: userChat.messages as unknown as Message[],
    };
  } catch (error) {
    console.log("Error fetching user scout chat:", error);
    throw error;
  }
}

export async function setUserChatToken<Tkind extends UserChat["kind"]>(
  userChatId: number,
  kind: Tkind,
): Promise<
  Omit<UserChat, "kind"> & {
    kind: Tkind;
  }
> {
  return withAuth(async () => {
    try {
      await prisma.userChat.updateMany({
        where: { id: userChatId, token: null, kind },
        data: { token: generateToken() },
      });
      const userChat = await prisma.userChat.findUnique({
        where: { id: userChatId, kind },
      });
      if (!userChat) notFound();
      return {
        ...userChat,
        kind: userChat.kind as Tkind,
        messages: userChat.messages as unknown as Message[],
      };
    } catch (error) {
      console.log("Error setting user chat token:", error);
      throw error;
    }
  });
}

export async function deleteMessageFromUserChat(
  userChatId: number,
  messages: Message[],
  messageId: string,
) {
  return withAuth(async (user) => {
    try {
      const userChat = await prisma.userChat.findUnique({
        where: { id: userChatId },
      });
      if (userChat?.userId != user.id) {
        forbidden();
      }
      const newMessages = [...messages];
      const index = newMessages.findIndex((message) => message.id === messageId);
      if (index >= 0 && newMessages[index].role === "user") {
        if (newMessages[index + 1]?.role === "assistant") {
          newMessages.splice(index, 2);
        } else {
          newMessages.splice(index, 1);
        }
      }
      await prisma.userChat.update({
        where: { id: userChatId },
        data: { messages: newMessages as unknown as InputJsonValue },
      });
      return newMessages;
    } catch (error) {
      console.log("Error deleting message from user chat:", error);
      throw error;
    }
  });
}

export async function fetchFeaturedStudyUserChats(): Promise<
  (Pick<UserChat, "title" | "token" | "kind"> & {
    readonly replayUrl: string;
    kind: "study";
  })[]
> {
  return withAuth(async (user) => {
    try {
      const userChats = await prisma.userChat.findMany({
        where: {
          token: {
            not: null,
          },
          kind: "study",
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: false,
          token: true,
          userId: false,
          title: true,
          kind: true,
          createdAt: false,
          updatedAt: false,
          messages: false,
        },
        take: 3,
      });
      return userChats
        .filter((chat) => chat.token)
        .map((chat) => {
          return {
            ...chat,
            kind: "study",
            replayUrl: `/study/${chat.token}/share?replay=1`,
          };
        });
    } catch (error) {
      console.log("Error fetching featured study user chats:", error);
      throw error;
    }
  });
}
