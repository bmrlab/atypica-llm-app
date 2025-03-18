import { prisma } from "@/lib/prisma";

export async function savePersona({
  name,
  source,
  tags,
  userids,
  personaPrompt,
  userChatId,
}: {
  name: string;
  source: string;
  tags: string[];
  userids: string[];
  personaPrompt: string;
  userChatId: number;
}) {
  try {
    const persona = await prisma.persona.create({
      data: {
        name,
        source,
        tags,
        samples: userids.map(
          (id) => `https://www.xiaohongshu.com/user/profile/${id}`,
        ),
        prompt: personaPrompt,
        userChatId,
      },
    });

    return {
      id: persona.id,
      plainText: `Saved persona prompt to DB with id ${persona.id}`,
    };
  } catch (error) {
    console.log("Error saving persona:", error);
    throw error;
  }
}
