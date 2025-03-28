import { PrismaClient } from "@prisma/client";
import { dirname } from "path";
import { fileURLToPath } from "url";

// 获取 __dirname (在 ESM 中需要特殊处理)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// this will load .env, so process.env.CIPHER_PASSWORD will be available
const prisma = new PrismaClient();

const generateToken = (length = 16) =>
  Array(length)
    .fill(0)
    .map(
      () => "abcdefghijkmnpqrstuvwxyzACDEFGHJKLMNPQRTUVWXY346792"[Math.floor(Math.random() * 51)],
    )
    .join("");

async function migrateAnalystReports() {
  try {
    const analysts = await prisma.analyst.findMany({
      where: {
        report: { not: "" },
      },
    });
    for (const analyst of analysts) {
      const reportExists = await prisma.analystReport.findFirst({
        where: {
          analystId: analyst.id,
        },
      });
      if (!reportExists) {
        const report = await prisma.analystReport.create({
          data: {
            analystId: analyst.id,
            token: generateToken(),
            coverSvg: "",
            onePageHtml: analyst.report,
            generatedAt: analyst.createdAt,
          },
        });
        console.log(`Analyst report created for analyst ${analyst.id}, report id: ${report.id}`);
      } else {
        console.log(
          `Analyst report already exists for analyst ${analyst.id}, report id: ${reportExists.id}`,
        );
      }
    }
  } catch (error) {
    console.log("Error migrating analyst reports:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function migrateMessages() {
  try {
    const studyUserChats = await prisma.userChat.findMany({
      where: { kind: "study" },
    });
    for (const chat of studyUserChats) {
      const messages = [];
      for (const message of chat.messages) {
        if (!message.parts) {
          messages.push(message);
          continue;
        }
        const parts = [];
        for (const part of message.parts) {
          if (part.type !== "tool-invocation") {
            parts.push(part);
            continue;
          }
          const toolInvocation = { ...part.toolInvocation };
          console.log("old", toolInvocation);
          if (toolInvocation.toolName === "interview") {
            toolInvocation.toolName = "interviewChat";
            if (toolInvocation.args.personaId) {
              toolInvocation.args.personas = [{ id: toolInvocation.args.personaId, name: "User" }];
              delete toolInvocation.args.personaId;
            }
          }
          if (toolInvocation.toolName === "analystReport") {
            const analystId = toolInvocation.args.analystId;
            const analyst = await prisma.analyst.findUniqueOrThrow({
              where: { id: analystId },
            });
            const report = await prisma.analystReport.create({
              data: {
                analystId: analyst.id,
                token: generateToken(),
                coverSvg: "",
                onePageHtml: analyst.report,
                generatedAt: analyst.createdAt,
              },
            });
            toolInvocation.args.instruction = "";
            toolInvocation.toolName = "generateReport";
            delete toolInvocation.result.url;
            if (toolInvocation.state === "result") {
              toolInvocation.result.reportId = report.id;
            }
          }
          console.log("new", toolInvocation);
          parts.push({ ...part, toolInvocation });
        }
        messages.push({ ...message, parts });
      }
      await prisma.userChat.update({
        where: { id: chat.id },
        data: { messages },
      });
    }
  } catch (error) {
    console.log("Error migrating messages:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// await migrateAnalystReports();
await migrateMessages();
