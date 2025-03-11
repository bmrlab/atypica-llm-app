import { PlainTextToolResult } from "@/tools/utils";

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
  const items = (data?.data?.items ?? []).filter(
    (item) => item.model_type === "note",
  );
  items.forEach(({ note }) => {
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

export async function xhsSearch({ keyword }: { keyword: string }) {
  try {
    const params = {
      token: process.env.XHS_API_TOKEN!,
      keyword,
      page: "1",
      sort: "general",
      noteType: "_0",
    };
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(
      `${process.env.XHS_API_BASE_URL}/search-note/v2?${queryString}`,
    );
    const data = await response.json();
    console.log("Response text:", JSON.stringify(data).slice(0, 100));
    const result = parseXHSSearchResult(data);
    return result;
  } catch (error) {
    console.error("Error fetching XHS feed:", error);
    throw error;
  }
}
