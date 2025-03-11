import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { NextResponse } from "next/server";
import { Persona } from "../route";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const filename = `${id}.yaml`;

  const filePath = path.join(process.cwd(), "public/personas", filename);

  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    const persona = yaml.load(fileContent) as Persona;
    return NextResponse.json(persona);
  } catch (error) {
    console.error(error);
    return new NextResponse("Persona not found", { status: 404 });
  }
}
