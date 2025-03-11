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
  contextSummary,
  question,
}: {
  contextSummary: string;
  question: string;
}): Promise<ReasoningThinkingResult> {
  const prompt = `作为专业顾问，请逐步仔细思考这个问题：
${question}

以下是问题有关的背景：
${contextSummary}
`;
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
