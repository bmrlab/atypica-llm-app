import { PlainTextToolResult } from "@/tools/utils";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { streamText, tool } from "ai";
import { z } from "zod";

const deepseek = createDeepSeek({
  apiKey: process.env.SILICONFLOW_API_KEY,
  baseURL: process.env.SILICONFLOW_BASE_URL,
});

export interface ReasoningThinkingResult extends PlainTextToolResult {
  reasoning: string;
  text: string;
  plainText: string;
}

async function reasoningThinking({
  background,
  question,
}: {
  background: string;
  question: string;
}): Promise<ReasoningThinkingResult> {
  const prompt = `
背景：
${background}

问题：
${question}
`;
  try {
    return new Promise(async (resolve, reject) => {
      const response = streamText({
        model: deepseek("Pro/deepseek-ai/DeepSeek-R1"),
        system: "你是一个专业的顾问，需要逐步仔细思考这个问题。用较少的文字回复，不要超过300字。",
        messages: [{ role: "user", content: prompt }],
        // maxTokens: 500,
        onChunk: (chunk) => console.log("[Reasoning]", JSON.stringify(chunk)),
        onFinish: (result) => {
          const reasoning = result.reasoning ?? "";
          const text = result.text ?? "";
          resolve({
            reasoning,
            text,
            plainText: text,
          });
        },
        onError: (error) => {
          console.log("Error generating reasoning thinking:", error);
          reject(error);
        },
      });
      await response.consumeStream();
    });
  } catch (error) {
    console.log("Error generating reasoning thinking:", error);
    throw error;
  }
}

export const reasoningThinkingTool = tool({
  description:
    "针对特定话题或问题提供专家分析和逐步思考过程，问问题的时候要把当前对话内容的总结也发给专家，以帮助专家更好地理解问题。",
  parameters: z.object({
    background: z.string().describe("问题的背景，你当前的发现和思考"),
    question: z.string().describe("问题或需要分析的主题"),
  }),
  experimental_toToolResultContent: (result: PlainTextToolResult) => {
    return [{ type: "text", text: result.plainText }];
  },
  execute: async (
    { background, question },
    {
      // 第二个参数有 messages 等数据
      // messages
    },
  ) => {
    const result = await reasoningThinking({ background, question });
    return result;
  },
});
