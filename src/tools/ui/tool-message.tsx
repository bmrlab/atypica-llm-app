import Image from "next/image";
import { FC } from "react";
import { ImageCarousel } from "./carousel";
import { XHSSearchResult } from "../xiaohongshu/search";
import { XHSUserNotesResult } from "../xiaohongshu/user-notes";
import { ReasoningThinkingResult } from "../experts/reasoning";
import { XHSNoteCommentsResult } from "../xiaohongshu/note-comments";
import { Markdown } from "@/components/markdown";

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
                  sizes="100%"
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
            {/* <div>{note.id}</div> */}
            <div className="text-gray-600 text-xs">
              <strong>评论数</strong>：{note.comments_count}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const XHSUserNotesResultMessage: FC<{ result: XHSUserNotesResult }> = ({
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
                  sizes="100%"
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

export const XHSNoteCommentsResultMessage: FC<{
  result: XHSNoteCommentsResult;
}> = ({ result: { comments } }) => {
  return (
    <div className="p-6 bg-gray-50 border border-gray-100 rounded-lg">
      {/* 只挑选 10 条展示 */}
      {comments.slice(0, 10).map((comment) => (
        <div
          key={comment.id}
          className="flex items-start justify-start gap-3 mb-4"
        >
          <div className="relative mt-2 w-8 h-8 rounded-full overflow-hidden">
            <Image
              src={comment.user.images}
              alt="User Avatar"
              className="object-cover"
              sizes="100%"
              fill
            />
          </div>
          <div>
            <strong className="text-xs text-gray-600">
              {comment.user.nickname}
            </strong>
            <p className="text-gray-600 text-xs mt-1 line-clamp-2">
              {comment.content}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export const ReasoningThinkingResultMessage: FC<{
  result: ReasoningThinkingResult;
}> = ({ result: { reasoning, text } }) => {
  return (
    <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-xs">
      <div className="text-gray-600 mb-3">{reasoning}</div>
      <Markdown>{text}</Markdown>
    </div>
  );
};
