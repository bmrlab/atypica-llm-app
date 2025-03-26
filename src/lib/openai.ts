import { createOpenAI } from "@ai-sdk/openai";

export default createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
  compatibility: "strict", // so stream_options will be sent
});
