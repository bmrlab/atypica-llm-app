import { PlainTextToolResult } from "@/tools/utils";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { generateText } from "ai";

const deepseek = createDeepSeek({
  apiKey: process.env.SILICONFLOW_API_KEY,
  baseURL: process.env.SILICONFLOW_BASE_URL,
});

export interface ReasoningThinkingResult extends PlainTextToolResult {
  reasoning: string;
  text: string;
  plainText: string;
}

export async function reasoningThinking({
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
    const result = await generateText({
      model: deepseek("Pro/deepseek-ai/DeepSeek-R1"),
      system: "你是一个专业的顾问，需要逐步仔细思考这个问题。",
      messages: [{ role: "user", content: prompt }],
      // maxTokens: 500,
    });
    const reasoning = result.reasoning ?? "";
    const text = result.text ?? "";
    return {
      reasoning,
      text,
      plainText: text,
    };
  } catch (error) {
    console.error("Error generating expert thinking:", error);
    throw error;
  }
}
