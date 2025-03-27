import { PlainTextToolResult } from "@/tools/utils";
import { tool } from "ai";
import { z } from "zod";

interface XHSNote {
  id: string;
  title: string;
  desc: string;
  type: string;
  liked_count: number;
  collected_count: number;
  comments_count: number;
  user: {
    nickname: string;
    userid: string;
    images: string;
  };
  images_list: {
    url: string;
    url_size_large: string;
    width: number;
    height: number;
  }[];
}

export interface XHSSearchResult extends PlainTextToolResult {
  notes: XHSNote[];
  // total: number;
  plainText: string;
}

function parseXHSSearchResult(data: {
  data: {
    items: {
      model_type: string;
      note: XHSNote;
    }[];
  };
}): XHSSearchResult {
  const notes: XHSNote[] = [];
  // 过滤并取前十条
  const topNotes = (data?.data?.items ?? [])
    .filter((item) => item.model_type === "note")
    .slice(0, 10);
  topNotes.forEach(({ note }) => {
    notes.push({
      id: note.id,
      title: note.title,
      desc: note.desc,
      type: note.type,
      liked_count: note.liked_count,
      collected_count: note.collected_count,
      comments_count: note.comments_count,
      user: {
        nickname: note.user.nickname,
        userid: note.user.userid,
        images: note.user.images,
      },
      images_list: note.images_list.map((image) => ({
        url: image.url,
        url_size_large: image.url_size_large,
        width: image.width,
        height: image.height,
      })),
    });
  });
  // 这个方法返回的结果会发给 LLM 用来生成回复，只需要把 LLM 能够使用的文本给它就行，节省很多 tokens
  const plainText = JSON.stringify(
    notes.map((note) => ({
      noteid: note.id,
      userid: note.user.userid,
      nickname: note.user.nickname,
      title: note.title,
      desc: note.desc,
      comments_count: note.comments_count,
    })),
  );
  return {
    notes,
    plainText,
  };
}

async function xhsSearch({ keyword }: { keyword: string }) {
  try {
    for (let i = 0; i < 3; i++) {
      const params = {
        token: process.env.XHS_API_TOKEN!,
        keyword,
        page: "1",
        sort: "general",
        noteType: "_0",
      };
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${process.env.XHS_API_BASE_URL}/search-note/v2?${queryString}`);
      const data = await response.json();
      console.log("Response text:", JSON.stringify(data).slice(0, 100));
      if (data.code === 0) {
        const result = parseXHSSearchResult(data);
        return result;
      } else {
        console.log("Failed to fetch XHS feed, retrying...", i + 1);
        continue;
      }
    }
    return {
      notes: [],
      plainText: "Failed to fetch XHS feed after 3 retries",
    };
  } catch (error) {
    console.log("Error fetching XHS feed:", error);
    throw error;
  }
}

export const xhsSearchTool = tool({
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
});
