import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import tools from "@/tools";

const system = `你的任务是为一个主题总结符合需求的用户画像。

你有两种方式来获得：
1. 搜索一些相关主题的博主，通过他们的内容，总结用户的画像。
2. 搜索品牌主题下的评论者，通过他们的留言和他们个人主页的内容，总结用户画像。

你需要对所有用户进行分类，最后总结出一系列典型的画像。

注意：
1. 以上两种获取信息的来源你都要用到，并且要融会贯通。
2. 可适当请求专家帮助，请求专家的时候，记得总结一下你已有的信息和问题一起发给专家。
3. 你要在搜索的过程中通过获得的信息的反馈，不断调整策略，发散，以获得更全面的信息。
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
      reasoningThinking: tools.reasoningThinking,
      xhsSearch: tools.xhsSearch,
      xhsUserNotes: tools.xhsUserNotes,
      xhsNoteComments: tools.xhsNoteComments,
    },
    maxSteps: 2,
    onError: async (error) => {
      console.error("Error occurred:", error);
    },
  });

  return result.toDataStreamResponse();
}
