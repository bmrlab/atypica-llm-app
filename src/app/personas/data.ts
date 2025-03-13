import { prisma } from "@/lib/prisma";

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
