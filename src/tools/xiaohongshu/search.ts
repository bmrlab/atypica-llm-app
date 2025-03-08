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

export interface XHSSearchResult {
  notes: XHSNote[];
  total: number;
}

function parseXHSSearchResult(data: {
  data: {
    items: {
      model_type: string;
      note: XHSNote;
    }[];
  };
}): XHSSearchResult {
  console.log("data", data);
  const notes: XHSNote[] = [];
  const items = data.data.items.filter((item) => item.model_type === "note");
  items.forEach((item) => {
    const note = item.note;
    notes.push(note);
  });
  return {
    notes,
    total: notes.length,
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
    const searchResult = parseXHSSearchResult(data);
    return searchResult;
  } catch (error) {
    console.error("Error fetching XHS feed:", error);
    throw error;
  }
}
