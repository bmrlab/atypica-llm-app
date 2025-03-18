import { PlainTextToolResult } from "@/tools/utils";
import { tool } from "ai";
import { z } from "zod";

interface XHSUserNote {
  id: string;
  title: string;
  desc: string;
  type: string;
  nice_count: number;
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

export interface XHSUserNotesResult extends PlainTextToolResult {
  notes: XHSUserNote[];
  plainText: string;
}

function parseXHSUserNotes(data: {
  data: {
    notes: XHSUserNote[];
  };
}): XHSUserNotesResult {
  const notes: XHSUserNote[] = [];
  // 只取前十条
  const topUserNotes = (data?.data?.notes ?? []).slice(0, 10);
  topUserNotes.forEach((note) => {
    notes.push({
      id: note.id,
      title: note.title,
      desc: note.desc,
      type: note.type,
      nice_count: note.nice_count,
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
  //
  const plainText = JSON.stringify(
    notes.map((note) => ({
      nodeid: note.id,
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

async function xhsUserNotes({ userid }: { userid: string }) {
  try {
    const params = {
      token: process.env.XHS_API_TOKEN!,
      userId: userid,
    };
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(
      `${process.env.XHS_API_BASE_URL}/get-user-note-list/v1?${queryString}`,
    );
    const data = await response.json();
    console.log("Response text:", JSON.stringify(data).slice(0, 100));
    const result = parseXHSUserNotes(data);
    return result;
  } catch (error) {
    console.log("Error fetching XHS user posts:", error);
    throw error;
  }
}

export const xhsUserNotesTool = tool({
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
});
