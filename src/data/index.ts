"use server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import {
  AnalystInterview as AnalystInterviewPrisma,
  Persona as PersonaPrisma,
  Analyst as AnalystPrisma,
} from "@prisma/client";

export type User = {
  id: number;
  email: string;
};

// Helper function to check authentication
async function withAuth<T>(action: (user: User) => Promise<T>): Promise<T> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/signin");
  }
  const user = session.user as User;
  return action(user);
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
  id: number,
): Promise<AnalystInterview | null> {
  return withAuth(async (user) => {
    try {
      const interview = await prisma.analystInterview.findUniqueOrThrow({
        where: { id },
      });
      const { messages } = interview;
      return {
        ...interview,
        messages: messages as AnalystInterview["messages"],
      };
    } catch (error) {
      console.error("Error fetching analyst interview", error);
      return null;
    }
  });
}

export async function upsertAnalystInterview({
  analystId,
  personaId,
}: {
  analystId: number;
  personaId: number;
}) {
  return withAuth(async (user) => {
    try {
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
      return interview;
    } catch (error) {
      console.error("Interview already exists", error);
      return null;
    }
  });
}

export type Analyst = AnalystPrisma;

export async function fetchAnalysts() {
  return withAuth(async (user) => {
    const analysts = await prisma.analyst.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return analysts.map((analyst) => {
      return { ...analyst };
    });
  });
}

export async function fetchAnalystById(id: number): Promise<Analyst | null> {
  return withAuth(async (user) => {
    try {
      const analyst = await prisma.analyst.findUniqueOrThrow({
        where: { id },
      });
      return { ...analyst };
    } catch (error) {
      console.error("Error fetching analyst:", error);
      return null;
    }
  });
}

export async function createAnalyst({
  role,
  topic,
}: Pick<Analyst, "role" | "topic">) {
  return withAuth(async (user) => {
    try {
      const analyst = await prisma.analyst.create({
        data: {
          role,
          topic,
          report: "", // Empty report for new analysts
        },
      });
      return analyst;
    } catch (error) {
      console.error("Error creating analyst:", error);
      return null;
    }
  });
}

export async function updateAnalyst(
  id: number,
  { role, topic, report }: Partial<Pick<Analyst, "role" | "topic" | "report">>,
) {
  return withAuth(async (user) => {
    try {
      const data: Partial<Pick<Analyst, "role" | "topic" | "report">> = {};
      if (typeof role !== "undefined") data.role = role;
      if (typeof topic !== "undefined") data.topic = topic;
      if (typeof report !== "undefined") data.report = report;
      const analyst = await prisma.analyst.update({
        where: { id },
        data,
      });
      return analyst;
    } catch (error) {
      console.error("Error updating analyst:", error);
      return null;
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
    console.error("Error fetching personas:", error);
    throw error;
  }
}

export async function fetchPersonaById(id: number): Promise<Persona | null> {
  try {
    const persona = await prisma.persona.findUniqueOrThrow({
      where: {
        id: id,
      },
    });
    return {
      ...persona,
      tags: persona.tags as string[],
    };
  } catch (error) {
    console.error("Error fetching persona:", error);
    return null;
  }
}
