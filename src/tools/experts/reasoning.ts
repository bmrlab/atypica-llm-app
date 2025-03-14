import { PlainTextToolResult } from "@/tools/utils";
import { createDeepSeek } from "@ai-sdk/deepseek";
import { streamText } from "ai";

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
    return new Promise(async (resolve, reject) => {
      const response = streamText({
        model: deepseek("Pro/deepseek-ai/DeepSeek-R1"),
        system:
          "你是一个专业的顾问，需要逐步仔细思考这个问题。用较少的文字回复，不要超过300字。",
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
          console.error("Error generating reasoning thinking:", error);
          reject(error);
        },
      });
      await response.consumeStream();
    });
  } catch (error) {
    console.error("Error generating reasoning thinking:", error);
    throw error;
  }
}
