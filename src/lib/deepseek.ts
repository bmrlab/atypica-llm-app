import { createDeepSeek } from "@ai-sdk/deepseek";

export default createDeepSeek({
  apiKey: process.env.SILICONFLOW_API_KEY,
  baseURL: process.env.SILICONFLOW_BASE_URL,
});
