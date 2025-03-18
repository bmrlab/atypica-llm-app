"use server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { forbidden, notFound, redirect } from "next/navigation";
import {
  AnalystInterview as AnalystInterviewPrisma,
  Persona as PersonaPrisma,
  Analyst as AnalystPrisma,
  UserScoutChat as UserScoutChatPrisma,
} from "@prisma/client";
import { Session } from "next-auth";
import { Message } from "ai";
import { InputJsonValue } from "@prisma/client/runtime/library";

// Helper function to check authentication
async function withAuth<T>(
  action: (user: NonNullable<Session["user"]>) => Promise<T>,
): Promise<T> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin");
  }
  return action(session.user);
}

export type AnalystInterview = Omit<AnalystInterviewPrisma, "messages"> & {
  messages: Message[];
};

export async function fetchAnalystInterviews(
  analystId: number,
): Promise<(AnalystInterview & { persona: Persona })[]> {
  return withAuth(async (user) => {
    const userAnalyst = await prisma.userAnalyst.findUnique({
      where: { userId_analystId: { userId: user.id, analystId } },
    });
    if (!userAnalyst) forbidden();
    const interviews = await prisma.analystInterview.findMany({
      where: { analystId },
      include: {
        persona: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return interviews.map((interview) => {
      const { persona, messages } = interview;
      return {
        ...interview,
        persona: {
          ...persona,
          tags: persona.tags as string[],
        },
        messages: messages as unknown as Message[],
      };
    });
  });
}

export async function fetchAnalystInterviewById(
  interviewId: number,
): Promise<AnalystInterview> {
  return withAuth(async (user) => {
    try {
      const interview = await prisma.analystInterview.findUnique({
        where: { id: interviewId },
      });
      if (!interview) notFound();
      const userAnalyst = await prisma.userAnalyst.findUnique({
        where: {
          userId_analystId: { userId: user.id, analystId: interview.analystId },
        },
      });
      if (!userAnalyst) forbidden();
      const { messages } = interview;
      return {
        ...interview,
        messages: messages as unknown as Message[],
      };
    } catch (error) {
      console.log("Error fetching analyst interview", error);
      throw error;
    }
  });
}

export async function upsertAnalystInterview({
  analystId,
  personaId,
}: {
  analystId: number;
  personaId: number;
}): Promise<AnalystInterview> {
  return withAuth(async (user) => {
    try {
      const userAnalyst = await prisma.userAnalyst.findUnique({
        where: { userId_analystId: { userId: user.id, analystId } },
      });
      if (!userAnalyst) forbidden();
      const interview = await prisma.analystInterview.upsert({
        where: {
          analystId_personaId: {
            analystId,
            personaId,
          },
        },
        update: {},
        create: {
          analystId,
          personaId,
          personaPrompt: "",
          interviewerPrompt: "",
          messages: [],
          conclusion: "",
        },
      });
      return {
        ...interview,
        messages: interview.messages as unknown as Message[],
      };
    } catch (error) {
      console.log("Interview already exists", error);
      throw error;
    }
  });
}

export async function updateAnalystInterview(
  analystInterviewId: number,
  {
    messages,
    conclusion,
  }: Partial<{
    messages: Message[];
    conclusion: string;
  }>,
): Promise<AnalystInterview> {
  try {
    const updatedInterview = await prisma.analystInterview.update({
      where: { id: analystInterviewId },
      data: {
        conclusion,
        messages: messages
          ? (messages as unknown as InputJsonValue)
          : undefined,
      },
    });
    return {
      ...updatedInterview,
      messages: updatedInterview.messages as unknown as Message[],
    };
  } catch (error) {
    console.log("Failed to update interview", error);
    throw error;
  }
}

export type Analyst = AnalystPrisma;

export async function fetchAnalysts() {
  return withAuth(async (user) => {
    const analysts = await prisma.analyst.findMany({
      where: {
        userAnalysts: {
          some: {
            userId: user.id,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return analysts.map((analyst) => {
      return { ...analyst };
    });
  });
}

export async function fetchAnalystById(analystId: number): Promise<Analyst> {
  return withAuth(async (user) => {
    try {
      const userAnalyst = await prisma.userAnalyst.findUnique({
        where: { userId_analystId: { userId: user.id, analystId } },
      });
      if (!userAnalyst) forbidden();
      const analyst = await prisma.analyst.findUnique({
        where: { id: analystId },
      });
      if (!analyst) notFound();
      return { ...analyst };
    } catch (error) {
      console.log("Error fetching analyst:", error);
      throw error;
    }
  });
}

export async function createAnalyst({
  role,
  topic,
}: Pick<Analyst, "role" | "topic">): Promise<Analyst> {
  return withAuth(async (user) => {
    try {
      const analyst = await prisma.analyst.create({
        // Empty report for new analysts
        data: { role, topic, report: "" },
      });
      await prisma.userAnalyst.create({
        data: {
          userId: user.id,
          analystId: analyst.id,
        },
      });
      return analyst;
    } catch (error) {
      console.log("Error creating analyst:", error);
      throw error;
    }
  });
}

export async function updateAnalyst(
  analystId: number,
  { role, topic, report }: Partial<Pick<Analyst, "role" | "topic" | "report">>,
): Promise<Analyst> {
  return withAuth(async (user) => {
    try {
      const userAnalyst = await prisma.userAnalyst.findUnique({
        where: { userId_analystId: { userId: user.id, analystId } },
      });
      if (!userAnalyst) forbidden();
      const data: Partial<Pick<Analyst, "role" | "topic" | "report">> = {};
      if (typeof role !== "undefined") data.role = role;
      if (typeof topic !== "undefined") data.topic = topic;
      if (typeof report !== "undefined") data.report = report;
      const analyst = await prisma.analyst.update({
        where: { id: analystId },
        data,
      });
      return analyst;
    } catch (error) {
      console.log("Error updating analyst:", error);
      throw error;
    }
  });
}

export type Persona = Omit<PersonaPrisma, "tags"> & {
  tags: string[];
};

export async function fetchPersonas(
  userScoutChatId?: number,
): Promise<Persona[]> {
  try {
    const personas = await prisma.persona.findMany({
      where: userScoutChatId ? { userScoutChatId } : undefined,
      orderBy: {
        createdAt: "desc",
      },
    });
    return personas.map((persona) => {
      return {
        ...persona,
        tags: persona.tags as string[],
      };
    });
  } catch (error) {
    console.log("Error fetching personas:", error);
    throw error;
  }
}

export async function fetchPersonaById(personaId: number): Promise<Persona> {
  try {
    const persona = await prisma.persona.findUnique({
      where: { id: personaId },
    });
    if (!persona) notFound();
    return {
      ...persona,
      tags: persona.tags as string[],
    };
  } catch (error) {
    console.log("Error fetching persona:", error);
    throw error;
  }
}

export type UserScoutChat = Omit<UserScoutChatPrisma, "messages"> & {
  messages: Message[];
};

export async function updateUserScoutChat(
  chatId: number,
  messages: Message[],
): Promise<UserScoutChat> {
  if (messages.length < 2) {
    // AI 回复了再保存
    throw new Error("No messages provided");
  }
  return withAuth(async () => {
    try {
      const userScoutChat = await prisma.userScoutChat.update({
        where: { id: chatId },
        data: { messages: messages as unknown as InputJsonValue },
      });
      return {
        ...userScoutChat,
        messages: userScoutChat.messages as unknown as Message[],
      };
    } catch (error) {
      console.log("Error creating user scout chat:", error);
      throw error;
    }
  });
}

export async function createUserScoutChat(
  message: Pick<Message, "role" | "content">,
): Promise<UserScoutChat> {
  return withAuth(async (user) => {
    try {
      const userScoutChat = await prisma.userScoutChat.create({
        data: {
          userId: user.id,
          title: message.content.substring(0, 50),
          messages: [message],
        },
      });
      return {
        ...userScoutChat,
        messages: userScoutChat.messages as unknown as Message[],
      };
    } catch (error) {
      console.log("Error creating user scout chat:", error);
      throw error;
    }
  });
}

export async function fetchUserScoutChats(): Promise<UserScoutChat[]> {
  return withAuth(async (user) => {
    try {
      const userScoutChats = await prisma.userScoutChat.findMany({
        where: { userId: user.id },
        orderBy: {
          createdAt: "desc",
        },
      });
      return userScoutChats.map((chat) => {
        return {
          ...chat,
          messages: chat.messages as unknown as Message[],
        };
      });
    } catch (error) {
      console.log("Error fetching user scout chats:", error);
      throw error;
    }
  });
}

export async function fetchUserScoutChatById(
  userScoutChatId: number,
): Promise<UserScoutChat> {
  return withAuth(async () => {
    try {
      const userScoutChat = await prisma.userScoutChat.findUnique({
        where: { id: userScoutChatId },
      });
      if (!userScoutChat) notFound();
      return {
        ...userScoutChat,
        messages: userScoutChat.messages as unknown as Message[],
      };
    } catch (error) {
      console.log("Error fetching user scout chat:", error);
      throw error;
    }
  });
}
