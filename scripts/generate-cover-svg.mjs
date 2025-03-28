import { createOpenAI } from "@ai-sdk/openai";
import { PrismaClient } from "@prisma/client";
import { streamText } from "ai";
import { dirname } from "path";
import { fileURLToPath } from "url";

// 获取 __dirname (在 ESM 中需要特殊处理)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// this will load .env, so process.env.xxx will be available
const prisma = new PrismaClient();

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
  compatibility: "strict", // so stream_options will be sent
});

const reportCoverSystem = () => `
你是一个专业的插画师，请为主题的网页报告生成一张引人入胜的插画，

插画要求：
- 格式：SVG 矢量图
- 尺寸：宽 600px × 高 300px
- 用途：作为案例卡片展示的封面图
- 风格：运用现代设计元素和创意布局，能直观反映报告主题
- 禁止使用：虚构的图片链接、占位符或无法访问的图像资源

设计原则：
- 将报告的核心主题和关键发现转化为视觉元素
- 使用简洁且富有表现力的图形语言
- 确保色彩选择与报告整体风格协调
- 创建独特且能立即吸引注意力的视觉标识
- 平衡抽象与具象表现，确保主题清晰传达

请直接生成SVG代码，无需解释或评论。SVG应当完整、自包含且能立即渲染。
`;

const reportCoverPrologue = (analyst, report) => `
主题为：

<topic>
${analyst.topic}
</topic>

网页报告内容为：

${report.onePageHtml}
`;

async function generateCover({ analyst, report }) {
  console.log(`Generating cover SVG for report ${report.id}`);
  const response = streamText({
    model: openai("claude-3-7-sonnet"),
    providerOptions: {
      openai: { stream_options: { include_usage: true } },
    },
    system: reportCoverSystem(),
    messages: [{ role: "user", content: reportCoverPrologue(analyst, report) }],
    maxSteps: 3,
    maxTokens: 20000,
    // onChunk: ({ chunk }) => {
    //   process.stdout.write(chunk.textDelta);
    // },
    onFinish: async (result) => {
      await prisma.analystReport.update({
        where: { id: report.id },
        data: { coverSvg: result.text },
      });
      console.log(`\nCover SVG generated successfully for report ${report.id}!\n`);
    },
  });
  await response.consumeStream();
}

async function generateCoverSvg() {
  try {
    let promises = [];
    const analystReports = await prisma.analystReport.findMany({
      where: { coverSvg: "" },
      include: { analyst: true },
    });
    for (const report of analystReports) {
      const promise = generateCover({ analyst: report.analyst, report });
      promises.push(promise);
      if (promises.length > 10) {
        await Promise.all(promises);
        promises = [];
      }
    }
    await Promise.all(promises);
  } catch (error) {
    console.log("Error migrating messages:", error);
  } finally {
    await prisma.$disconnect();
  }
}

await generateCoverSvg();
