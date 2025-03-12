import path from "path";
import fs from "fs/promises";
import YAML from "js-yaml";

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
    const timestamp = Date.now();
    const date = new Date(timestamp).toISOString().split("T")[0];
    const filename = `${timestamp}.yaml`;
    const dirPath = path.join(process.cwd(), "public/personas");

    // Ensure directory exists
    await fs.mkdir(dirPath, { recursive: true });

    // Save file
    const filePath = path.join(dirPath, filename);
    const content = YAML.dump({
      title,
      date,
      source,
      tags,
      userids: userids.map(
        (id) => `https://www.xiaohongshu.com/user/profile/${id}`,
      ),
      prompt: personaPrompt,
    });
    await fs.writeFile(filePath, content);

    return {
      filePath,
      timestamp,
      plainText: `Saved persona prompt to ${filePath}`,
    };
  } catch (error) {
    console.error("Error saving persona:", error);
    throw error;
  }
}
