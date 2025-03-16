import { PrismaClient } from "@prisma/client";
import yaml from "js-yaml";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

// 获取 __dirname (在 ESM 中需要特殊处理)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const prisma = new PrismaClient();

async function importPersonas() {
  try {
    // 读取 personas 目录下的所有 yaml 文件
    const personasDir = path.join(__dirname, "../public/personas");
    const files = fs.readdirSync(personasDir);

    for (const file of files) {
      if (file.endsWith(".yaml")) {
        console.log(`Processing ${file}...`);

        // 读取并解析 YAML 文件
        const filePath = path.join(personasDir, file);
        const fileContent = fs.readFileSync(filePath, "utf8");
        const persona = yaml.load(fileContent);

        // 创建数据库记录
        const result = await prisma.persona.create({
          data: {
            name: persona.title,
            source: persona.source,
            tags: persona.tags || [],
            samples: persona.userids || [],
            prompt: persona.prompt,
          },
        });

        console.log(`Imported persona: ${result.title}`);
      }
    }

    console.log("Import completed successfully!");
  } catch (error) {
    console.log("Error importing personas:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// 运行导入
importPersonas();
