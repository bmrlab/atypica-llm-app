import fs from "fs";
import path from "path";
import yaml from "js-yaml";

export interface Persona {
  id: string;
  title: string;
  date: string;
  source: string;
  tags: string[];
  prompt: string;
}

export async function fetchAllPersonas() {
  const personasDirectory = path.join(process.cwd(), "public/personas");
  const files = fs.readdirSync(personasDirectory);
  const yamlFiles = files.filter((file) => file.endsWith(".yaml"));

  const personas = yamlFiles.map((filename) => {
    const filePath = path.join(personasDirectory, filename);
    const fileContent = fs.readFileSync(filePath, "utf8");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jsonData: any = yaml.load(fileContent);
    jsonData.id = filename.replace(".yaml", "");
    return jsonData as Persona;
  });

  return personas;
}

export async function fetchPersonaById(id: string): Promise<Persona | null> {
  const filename = `${id}.yaml`;
  const filePath = path.join(process.cwd(), "public/personas", filename);

  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    return yaml.load(fileContent) as Persona;
  } catch (error) {
    console.error(error);
    return null;
  }
}
