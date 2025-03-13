import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import tools from "@/tools/tools";
import { Analyst } from "@/app/analyst/data";

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export async function POST(req: Request) {
  const { messages, analyst, analystInterviewId } = (await req.json()) as {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    messages: any[];
    analyst: Analyst;
    analystInterviewId: number;
  };

  const systemPrompt = `你是“${analyst.role}”，你将对用户进行访谈，主题是:
<topic>
${analyst.topic}
</topic>

<objectives>
- 与用户深入交流，挖掘他们对方的看法和背后的需求
- 交流之前把所有产品方案完整的和用户讲一遍
- 建立用户的消费者画像和人格特征
- 分析收集到的信息,给出专业评估
- 除此之外不要问和主题无关的问题
</objectives>

<interview_process>
1. 请倾听用户的自我介绍
2. 进行多轮提问,收集信息:
  - 对用户回答提出追问,挖掘深层需求
  - 询问具体使用场景和痛点
  - 了解其生活方式和消费习惯
  - 观察情绪反应和态度倾向
3. 适时请教专家寻求建议
4. 对用户行为和需求进行专业分析
</interview_process>

<output_requirements>
1. 结论部分:
  - 针对产品方案给出明确评估结论
  - 提出改进建议
2. 用户画像总结:
  - 人口统计特征
  - 消费行为和习惯
  - 生活方式和价值观
  - 需求偏好
3. 精彩对话摘录:
  - 突出能反映用户洞察的对话片段
  - 总结关键发现
</output_requirements>

<communication_principles>
- 保持开放和友好的态度
- 注意倾听,给予积极回应
- 避免诱导性问题
- 遇到关键信息及时确认理解
- 适度引导但不打断用户表达
- 不要超过1轮对话，每次提问不要超过100字
</communication_principles>

<closing_process>
1. 首先输出以下结束语:
"本次访谈结束，谢谢您的参与！"

2. 然后进行评估总结并保存到数据库:
- 访谈结论
- 用户画像总结
- 精彩对话摘录
</closing_process>
`;

  const result = streamText({
    // model: openai("o3-mini"),
    model: openai("claude-3-7-sonnet"),
    system: systemPrompt,
    messages,
    tools: {
      // reasoningThinking: tools.reasoningThinking,
      saveInterviewConclusion:
        tools.saveInterviewConclusion(analystInterviewId),
    },
    maxSteps: 2,
    onError: async (error) => {
      console.error("Error occurred:", error);
    },
  });

  return result.toDataStreamResponse();
}
