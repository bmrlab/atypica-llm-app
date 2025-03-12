import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { NextResponse } from "next/server";
import { Persona } from "../route";

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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const persona = await fetchPersonaById(id);

  if (!persona) {
    return new NextResponse("Persona not found", { status: 404 });
  }

  return NextResponse.json(persona);
}
