import { streamText } from "ai";
import { prisma } from "@/lib/prisma";
import openai from "@/lib/openai";

export async function POST(req: Request) {
  const { analystId } = (await req.json()) as {
    analystId: number;
  };

  const analyst = await prisma.analyst.findUnique({
    where: { id: analystId },
    include: {
      interviews: {
        where: {
          conclusion: {
            not: "",
          },
        },
      },
    },
  });

  if (!analyst) {
    return new Response("Analyst not found", { status: 404 });
  }

  const systemPrompt = `
你是一个品牌研究专家和 UI/UX 设计师。
现在需要你基于一系列用户访谈生成一份具有现代感的总结报告。

请遵循以下要求：
1. 使用 HTML 格式输出一个总结页面
2. 用叙事的方式讲述
3. 要体现出和用户的互动性
4. 要有观点，要抓眼球

风格要求：
1. 采用类似苹果官网的简约科技风格
2. 使用大量留白空间
3. 运用优雅的Typography
4. 内容块之间要有良好的视觉层次
5. 使用渐变效果突出重要内容
6. 适当使用动态效果提示（如 hover 状态）

请使用以下技术元素：
1. Tailwind CSS 作为样式框架
2. 运用现代化图表展示数据（使用 HTML/CSS 实现简单图表）
3. 使用 CSS Grid 和 Flexbox 布局
4. 响应式设计原则

内容结构要求：
1. 使用语义化 HTML 标签

具体样式规范：
1. 使用优雅的颜色方案：
   - 主色：#000000
   - 强调色：#0066CC
   - 背景色：#FFFFFF, #F5F5F7
   - 渐变：linear-gradient(135deg, #0066CC, #5AC8FA)

2. 版式设计：
   - 标题：text-4xl md:text-5xl font-bold
   - 副标题：text-2xl md:text-3xl font-semibold
   - 正文：text-base leading-relaxed
   - 间距：p-6 md:p-12 space-y-24

3. 交互效果：
   - 卡片悬浮效果：hover:shadow-lg transition-all
   - 按钮效果：hover:scale-105 transition-transform

4. 布局：
   - 使用 max-w-7xl mx-auto 控制内容宽度
   - 使用 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 布局卡片

请确保输出的 HTML 包含这些样式类，并注意响应式设计

`;

  const userMessage = `
我的角色是<role>${analyst.role}</role>，

研究主题是：
<topic>
${analyst.topic}
</topic>

以下是我们的访谈总结：

${analyst.interviews.map((interview) => `<conclusion>\n${interview.conclusion}\n</conclusion>`).join("\n\n")}
`;

  const result = streamText({
    model: openai("claude-3-7-sonnet"),
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
    maxSteps: 10,
    maxTokens: 100000,
    onFinish: async (message) => {
      await prisma.analyst.update({
        where: { id: analystId },
        data: { report: message.text },
      });
    },
  });

  return result.toDataStreamResponse();
}
