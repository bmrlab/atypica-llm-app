"use server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth/next";
import { forbidden, notFound, redirect } from "next/navigation";
import {
  AnalystInterview as AnalystInterviewPrisma,
  Persona as PersonaPrisma,
  Analyst as AnalystPrisma,
} from "@prisma/client";
import { Session } from "next-auth";

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

export type AnalystInterview = AnalystInterviewPrisma & {
  messages: {
    id: string;
    role: "data" | "system" | "user" | "assistant";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    content: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parts?: any[];
  }[];
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
        messages: messages as AnalystInterview["messages"],
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
        messages: messages as AnalystInterview["messages"],
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
        messages: interview.messages as AnalystInterview["messages"],
      };
    } catch (error) {
      console.log("Interview already exists", error);
      throw error;
    }
  });
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

export type Persona = PersonaPrisma & {
  tags: string[];
};

export async function fetchPersonas(): Promise<Persona[]> {
  try {
    const personas = await prisma.persona.findMany({
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
