import { tool } from "ai";
import { xhsSearch } from "@/tools/xiaohongshu/search";
import { xhsUserNotes } from "@/tools/xiaohongshu/user-notes";
import { reasoningThinking } from "@/tools/experts/reasoning";
import { z } from "zod";
import { PlainTextToolResult } from "@/tools/utils";
import { xhsNoteComments } from "./xiaohongshu/note-comments";
import { savePersona } from "./system/save-persona";
import { saveInterviewConclusion } from "./system/save-interview-conclusion";

const tools = {
  reasoningThinking: tool({
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
  }),
  xhsSearch: tool({
    description: "在小红书上搜索笔记，可以搜索特定的主题，也可以搜索一个品牌",
    parameters: z.object({
      keyword: z.string().describe("Search keywords"),
    }),
    // 这个方法返回的结果会发给 LLM 用来生成回复，只需要把 LLM 能够使用的文本给它就行，节省很多 tokens
    experimental_toToolResultContent: (result: PlainTextToolResult) => {
      return [{ type: "text", text: result.plainText }];
    },
    execute: async ({ keyword }) => {
      const result = await xhsSearch({ keyword });
      return result;
    },
  }),
  xhsUserNotes: tool({
    description: "获取小红书特定用户的帖子，用于分析用户的特征和喜好",
    parameters: z.object({
      userid: z.string().describe("The user ID to fetch notes from"),
    }),
    experimental_toToolResultContent: (result: PlainTextToolResult) => {
      return [{ type: "text", text: result.plainText }];
    },
    execute: async ({ userid }) => {
      const result = await xhsUserNotes({ userid });
      return result;
    },
  }),
  xhsNoteComments: tool({
    description:
      "获取小红书特定帖子的评论，用于获取对特定品牌或者主题关注的用户，以及他们的反馈",
    parameters: z.object({
      noteid: z.string().describe("The note ID to fetch comments from"),
    }),
    experimental_toToolResultContent: (result: PlainTextToolResult) => {
      return [{ type: "text", text: result.plainText }];
    },
    execute: async ({ noteid }) => {
      const result = await xhsNoteComments({ noteid });
      return result;
    },
  }),
  savePersona: (userScoutChatId: number) =>
    tool({
      description: "将生成的 persona prompt 保存到数据库",
      parameters: z.object({
        name: z.string().describe("Persona 的名字"),
        source: z.string().describe("数据来源"),
        tags: z.array(z.string()).describe("相关标签"),
        userids: z.array(z.string()).describe("该人设典型的用户 ID 列表"),
        personaPrompt: z.string().describe("生成的 persona prompt 内容"),
      }),
      experimental_toToolResultContent: (result: PlainTextToolResult) => {
        return [{ type: "text", text: result.plainText }];
      },
      execute: async ({ name, source, tags, userids, personaPrompt }) => {
        const result = await savePersona({
          name,
          source,
          tags,
          userids,
          personaPrompt,
          userScoutChatId,
        });
        return result;
      },
    }),
  saveInterviewConclusion: (interviewId: number, interviewToken?: string) =>
    tool({
      description: "将生成的结论保存到数据库",
      parameters: z.object({
        conclusion: z.string().describe("生成的结论"),
      }),
      experimental_toToolResultContent: (result: PlainTextToolResult) => {
        return [{ type: "text", text: result.plainText }];
      },
      execute: async ({ conclusion }) => {
        const result = await saveInterviewConclusion({
          interviewId,
          interviewToken,
          conclusion,
        });
        return result;
      },
    }),
};

export default tools;
