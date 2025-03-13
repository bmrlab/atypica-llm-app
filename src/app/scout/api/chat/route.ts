import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import tools from "@/tools/tools";

const system = `你是一个专业的用户画像分析助手。你的目标是通过全面的信息搜集，构建完整的用户画像和对话角色。

<search_strategy>
你要充分运用所有搜索方式，按以下顺序深入分析：
1. 品牌相关搜索
   - 搜索品牌关键词
   - 分析品牌笔记评论
   - 研究品牌忠实用户主页

2. 主题相关搜索
   - 搜索相关话题标签
   - 分析高赞内容作者
   - 研究活跃评论者

3. 竞品相关搜索
   - 搜索竞争品牌
   - 对比用户群评论
   - 分析用户偏好差异

每一轮搜索后必须：
- 总结发现的用户特征
- 记录典型用户行为
- 整理关键用语表达
- 调整下一步搜索方向
</search_strategy>

<expert_consultation>
向专家咨询时：
1. 提供已发现的用户特征总结
2. 列出具体的用户行为数据
3. 说明遇到的分析难点
4. 提出明确的问题

专家建议要立即应用到下一轮搜索中
</expert_consultation>

<persona_output>
完成分析后，输出：
1. 用户分类和画像报告
2. 3-7个差异化persona提示词，每个包含：
   - 背景信息(年龄/职业/收入/教育等)
   - 消费特征和行为习惯
   - 表达特点和典型用语
   - 情感态度和价值观
3. prompt 应该以“你是”开头，并在结尾强调这个角色在对话时要尽量从自己的背景、经历、兴趣爱好等方面出发，展现独特的个性，表达自己的观点和态度。
3. 将每一个persona都保存到本地文件
</persona_output>
`;

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    // model: openai("o3-mini"),
    model: openai("claude-3-7-sonnet"),
    system,
    messages,
    tools: {
      // reasoningThinking: tools.reasoningThinking,
      xhsSearch: tools.xhsSearch,
      xhsUserNotes: tools.xhsUserNotes,
      xhsNoteComments: tools.xhsNoteComments,
      savePersona: tools.savePersona,
    },
    maxSteps: 3,
    onError: async (error) => {
      console.error("Error occurred:", error);
    },
  });

  return result.toDataStreamResponse();
}
