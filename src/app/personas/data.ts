import { prisma } from "@/lib/prisma";

export interface Persona {
  id: string;
  title: string;
  source: string;
  tags: string[];
  prompt: string;
}

export async function fetchAllPersonas(): Promise<Persona[]> {
  try {
    const personas = await prisma.persona.findMany();
    return personas.map((persona) => {
      return {
        id: persona.id.toString(),
        title: persona.title,
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

// fetchPersonaById 也可以用 Prisma 重写
export async function fetchPersonaById(id: string): Promise<Persona | null> {
  try {
    const persona = await prisma.persona.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    if (!persona) {
      return null;
    }
    return {
      id: persona.id.toString(),
      title: persona.title,
      source: persona.source,
      tags: persona.tags as string[],
      prompt: persona.prompt,
    };
  } catch (error) {
    console.error("Error fetching persona:", error);
    return null;
  }
}
