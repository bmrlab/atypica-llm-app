import { prisma } from "@/lib/prisma";

export interface AnalystInterview {
  id: number;
  analystId: number;
  personaId: number;
  personaPrompt: string;
  interviewerPrompt: string;
  messages: {
    role: "data" | "system" | "user" | "assistant";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    content: any;
  }[];
  conclusion: string;
}

export interface Analyst {
  id: number;
  role: string;
  topic: string;
  report: string;
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
    const personas = await prisma.persona.findMany();
    return personas.map((persona) => {
      return {
        id: persona.id,
        name: persona.name,
        source: persona.source,
        tags: persona.tags as string[],
        prompt: persona.prompt,
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
