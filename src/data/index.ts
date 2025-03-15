import { prisma } from "@/lib/prisma";

export interface AnalystInterview {
  id: number;
  analystId: number;
  personaId: number;
  personaPrompt: string;
  interviewerPrompt: string;
  messages: {
    id: string;
    role: "data" | "system" | "user" | "assistant";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    content: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parts?: any[];
  }[];
  conclusion: string;
  interviewToken: string | null;
}

export async function fetchAnalystInterviews(
  analystId: number,
): Promise<(AnalystInterview & { persona: Persona })[]> {
  const interviews = await prisma.analystInterview.findMany({
    where: { analystId },
    include: {
      persona: true,
    },
  });
  return interviews.map((interview) => {
    const {
      id,
      analystId,
      personaId,
      persona,
      personaPrompt,
      interviewerPrompt,
      messages,
      conclusion,
      interviewToken,
    } = interview;
    return {
      id,
      analystId,
      personaId,
      persona: {
        id: persona.id,
        name: persona.name,
        source: persona.source,
        tags: persona.tags as string[],
        prompt: persona.prompt,
      },
      personaPrompt,
      interviewerPrompt,
      messages: messages as AnalystInterview["messages"],
      conclusion,
      interviewToken,
    };
  });
}

export interface Analyst {
  id: number;
  role: string;
  topic: string;
  report: string;
}

export async function fetchAnalysts() {
  const analysts = await prisma.analyst.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
  return analysts.map(({ id, role, topic, report }) => {
    return {
      id,
      role,
      topic,
      report,
    };
  });
}

export async function fetchAnalystById(id: number): Promise<Analyst | null> {
  try {
    const analyst = await prisma.analyst.findUnique({
      where: {
        id: id,
      },
    });
    if (!analyst) {
      return null;
    }
    return {
      id: analyst.id,
      role: analyst.role,
      topic: analyst.topic,
      report: analyst.report,
    };
  } catch (error) {
    console.error("Error fetching analyst:", error);
    return null;
  }
}

export interface Persona {
  id: number;
  name: string;
  source: string;
  tags: string[];
  prompt: string;
}

export async function fetchAllPersonas(): Promise<Persona[]> {
  try {
    const personas = await prisma.persona.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return personas.map(({ id, name, source, tags, prompt }) => {
      return {
        id,
        name,
        source,
        tags: tags as string[],
        prompt,
      };
    });
  } catch (error) {
    console.error("Error fetching personas:", error);
    throw error;
  }
}

export async function fetchPersonaById(id: number): Promise<Persona | null> {
  try {
    const persona = await prisma.persona.findUnique({
      where: {
        id: id,
      },
    });
    if (!persona) {
      return null;
    }
    return {
      id: persona.id,
      name: persona.name,
      source: persona.source,
      tags: persona.tags as string[],
      prompt: persona.prompt,
    };
  } catch (error) {
    console.error("Error fetching persona:", error);
    return null;
  }
}
