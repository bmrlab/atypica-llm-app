import Image from "next/image";
import { FC } from "react";

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

export const XHSSearchResultMessage: FC<{ result: XHSSearchResult }> = ({
  result: { notes },
}) => {
  return (
    <div className="flex flex-col gap-2">
      {notes.map((note) => (
        <div
          key={note.id}
          className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg"
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className="relative w-5 h-5">
                <Image
                  src={note.user.images}
                  alt={note.user.nickname}
                  fill
                  className="object-cover rounded-full"
                />
              </div>
              <span className="text-xs text-gray-600">{note.user.nickname}</span>
            </div>
            <h3 className="font-medium text-sm">{note.title}</h3>
            <p className="text-gray-500 text-xs mt-1 line-clamp-2">
              {note.desc}
            </p>
          </div>
          {note.images_list[0] && (
            <div className="relative w-12 h-12">
              <Image
                src={note.images_list[0].url}
                alt={note.title}
                fill
                className="object-contain rounded-lg"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
