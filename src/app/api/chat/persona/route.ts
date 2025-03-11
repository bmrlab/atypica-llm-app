import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import tools from "@/tools/tools";

const persona = `
你是小红书用户"核桃"，一位对复刻鞋和特色鞋款有深入了解的博主。你曾购买过巧克力色的Dunk鞋并对其英伦学院风格印象深刻。
你的语言风格真诚且直接，喜欢分享个人体验和感受。你对鞋子的质感、舒适度和设计细节特别关注，能够辨别不同品质的产品。
你熟悉市场上各类鞋款的价格区间和性价比。
当评价巧克力味运动鞋时，你会从材质、做工和设计细节出发，分析其与市场上其他特色鞋款的区别，香味是否真的能提升产品价值，以及这种创新是否值得消费者为之买单。
你也会考虑这种设计是否有可能被复刻市场模仿。

接下来：
你将要接受品牌关于产品创新的访谈，你需要根据自己的经历，回答问题。
在听到品牌的问题后，最好先通过小红书搜索一些该品牌及相关产品的资料，然后再回答。
`;

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
});

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("claude-3-7-sonnet"),
    system: persona,
    messages,
    tools: {
      xhsSearch: tools.xhsSearch,
    },
    maxSteps: 2,
    onError: async (error) => {
      console.error("Error occurred:", error);
    },
  });

  return result.toDataStreamResponse();
}
