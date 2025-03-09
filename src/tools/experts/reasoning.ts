import { PlainTextToolResult } from "@/tools/utils";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { generateText } from "ai";

const deepseek = createDeepSeek({
  apiKey: process.env.SILICONFLOW_API_KEY,
  baseURL: process.env.SILICONFLOW_BASE_URL,
});

export interface ReasoningThinkingResult extends PlainTextToolResult {
  reasoning: string;
  plainText: string;
}

export async function reasoningThinking({
  query,
}: {
  query: string;
}): Promise<ReasoningThinkingResult> {
  const prompt = `作为专业顾问，请逐步仔细思考这个问题：
${query}

请按以下结构回答：
1. 初步分析
2. 关键考虑因素
3. 逐步推理过程
4. 结论`;
  try {
    const result = await generateText({
      model: deepseek("Pro/deepseek-ai/DeepSeek-R1"),
      messages: [{ role: "user", content: prompt }],
      maxTokens: 500,
    });
    const reasoning = result.reasoning ?? "";
    return {
      reasoning,
      plainText: reasoning,
    };
  } catch (error) {
    console.error("Error generating expert thinking:", error);
    throw error;
  }
}
