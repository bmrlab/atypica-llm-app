import { Analyst } from "@/data";

export const reportHTMLSystem = () => `
你是一个品牌研究专家和 UI/UX 设计师。
现在需要你基于一系列用户访谈生成一份具有现代感的总结报告。

请遵循以下要求：
1. 使用 HTML 格式输出一个总结页面
2. 开篇就要有明确的结论
3. 用叙事的方式讲述
4. 要体现出和用户的互动性
5. 要有观点，要抓眼球

风格要求：
1. 根据调研主题选择最适合的现代网页风格
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
2. 使用优雅的颜色方案
3. 版式设计有层次
4. 不要包含下载按钮等没有意义的交互
`;

export const reportHTMLPrologue = (
  analyst: Analyst & {
    interviews: {
      conclusion: string;
    }[];
  },
) => `
我的角色是<role>${analyst.role}</role>，

研究主题是：

<topic>
${analyst.topic}
</topic>

以下是我们的访谈总结：

${analyst.interviews.map((interview) => `<conclusion>\n${interview.conclusion}\n</conclusion>`).join("\n\n")}
`;
