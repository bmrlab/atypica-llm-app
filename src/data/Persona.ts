"use server";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Persona as PersonaPrisma } from "@prisma/client";
// import withAuth from "./withAuth";

export type Persona = Omit<PersonaPrisma, "tags"> & {
  tags: string[];
};

export async function fetchPersonas(userChatId?: number): Promise<Persona[]> {
  try {
    const personas = await prisma.persona.findMany({
      where: userChatId ? { userChatId } : undefined,
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
