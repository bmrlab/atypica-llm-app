import Image from "next/image";
import { FC } from "react";
import { ImageCarousel } from "./carousel";
import { XHSSearchResult } from "../xiaohongshu/search";
import { XHSUserPostsResult } from "../xiaohongshu/userPosts";
import { ReasoningThinkingResult } from "../experts/reasoning";

export const XHSSearchResultMessage: FC<{ result: XHSSearchResult }> = ({
  result: { notes },
}) => {
  return (
    <div className="flex flex-row gap-6 flex-wrap p-6 bg-gray-50 border border-gray-100 rounded-lg">
      {/* 只挑选 10 条展示 */}
      {notes.slice(0, 10).map((note) => (
        <div key={note.id} className="flex flex-col items-center w-[180px]">
          <ImageCarousel images={note.images_list} />
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="relative w-5 h-5">
                <Image
                  src={note.user.images}
                  alt="User Avatar"
                  fill
                  className="object-cover rounded-full"
                />
              </div>
              <span className="text-xs text-gray-600">
                {note.user.nickname}
              </span>
            </div>
            <h3 className="font-medium text-sm line-clamp-1">{note.title}</h3>
            <p className="text-gray-600 text-xs mt-1 line-clamp-2">
              {note.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export const XHSUserPostsResultMessage: FC<{ result: XHSUserPostsResult }> = ({
  result: { notes },
}) => {
  return (
    <div className="flex flex-row gap-6 flex-wrap p-6 bg-gray-50 border border-gray-100 rounded-lg">
      {/* 只挑选 5 条展示 */}
      {notes.slice(0, 5).map((note) => (
        <div key={note.id} className="flex flex-col items-center w-[180px]">
          <ImageCarousel images={note.images_list} />
          <div className="p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="relative w-5 h-5">
                <Image
                  src={note.user.images}
                  alt="User Avatar"
                  fill
                  className="object-cover rounded-full"
                />
              </div>
              <span className="text-xs text-gray-600">
                {note.user.nickname}
              </span>
            </div>
            <h3 className="font-medium text-sm line-clamp-1">{note.title}</h3>
            <p className="text-gray-600 text-xs mt-1 line-clamp-2">
              {note.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export const ReasoningThinkingResultMessage: FC<{
  result: ReasoningThinkingResult;
}> = ({ result: { reasoning } }) => {
  return (
    <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-xs">
      {reasoning}
    </div>
  );
};
