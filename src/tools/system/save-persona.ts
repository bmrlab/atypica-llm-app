import { prisma } from "@/lib/prisma";

export async function savePersona({
  title,
  source,
  tags,
  userids,
  personaPrompt,
}: {
  title: string;
  source: string;
  tags: string[];
  userids: string[];
  personaPrompt: string;
}) {
  try {
    const persona = await prisma.persona.create({
      data: {
        title,
        source,
        tags, // 假设数据库支持数组类型
        userids: userids.map(
          (id) => `https://www.xiaohongshu.com/user/profile/${id}`,
        ),
        prompt: personaPrompt,
      },
    });

    return {
      id: persona.id,
      plainText: `Saved persona prompt to DB with id ${persona.id}`,
    };
  } catch (error) {
    console.error("Error saving persona:", error);
    throw error;
  }
}
