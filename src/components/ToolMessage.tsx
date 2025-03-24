import { Markdown } from "@/components/markdown";
import { ReasoningThinkingResult } from "@/tools/experts/reasoning";
import { SaveAnalystToolResult } from "@/tools/system/saveAnalyst";
import { XHSNoteCommentsResult } from "@/tools/xhs/noteComments";
import { XHSSearchResult } from "@/tools/xhs/search";
import { XHSUserNotesResult } from "@/tools/xhs/userNotes";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";
// import { ImageCarousel } from "./ImageCarousel";

export const XHSSearchResultMessage: FC<{ result: XHSSearchResult }> = ({ result: { notes } }) => {
  return (
    <div className="flex flex-row gap-3 w-full overflow-x-scroll p-3 bg-gray-50 border border-gray-100 rounded-md">
      {/* 只挑选 5 条展示 */}
      {notes.slice(0, 5).map((note) => (
        <div key={note.id} className="flex flex-col items-center w-[120px]">
          {/* <ImageCarousel images={note.images_list} /> */}
          <div className="relative w-[120px] h-[120px] rounded-lg overflow-hidden">
            <Image
              src={note.images_list[0]?.url}
              alt="Note image"
              fill
              sizes="100%"
              className="object-cover"
            />
          </div>
          <div className="p-1">
            <div className="flex items-center gap-1 mb-1">
              <div className="relative w-4 h-4">
                <Image
                  src={note.user.images}
                  alt="User Avatar"
                  sizes="100%"
                  fill
                  className="object-cover rounded-full"
                />
              </div>
              <div className="text-xs text-gray-600 line-clamp-1">{note.user.nickname}</div>
            </div>
            <h3 className="font-medium text-xs line-clamp-1">{note.title}</h3>
            <p className="text-gray-600 text-xs mt-1 line-clamp-2">{note.desc}</p>
            {/* <div>{note.id}</div> */}
            {/* <div className="text-gray-600 text-xs mt-1">评论数：{note.comments_count}</div> */}
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
    <div className="flex flex-row gap-3 w-full overflow-x-scroll p-3 bg-gray-50 border border-gray-100 rounded-md">
      {/* 只挑选 5 条展示 */}
      {notes.slice(0, 5).map((note) => (
        <div key={note.id} className="flex flex-col items-center w-[120px]">
          {/* <ImageCarousel images={note.images_list} /> */}
          <div className="relative w-[120px] h-[120px] rounded-lg overflow-hidden">
            <Image
              src={note.images_list[0]?.url}
              alt="Note image"
              fill
              sizes="100%"
              className="object-cover"
            />
          </div>
          <div className="p-1">
            <div className="flex items-center gap-1 mb-1">
              <div className="relative w-4 h-4">
                <Image
                  src={note.user.images}
                  alt="User Avatar"
                  sizes="100%"
                  fill
                  className="object-cover rounded-full"
                />
              </div>
              <div className="text-xs text-gray-600 line-clamp-1">{note.user.nickname}</div>
            </div>
            <h3 className="font-medium text-xs line-clamp-1">{note.title}</h3>
            <p className="text-gray-600 text-xs mt-1 line-clamp-2">{note.desc}</p>
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
    <div className="p-3 bg-gray-50 border border-gray-100 rounded-md">
      {/* 只挑选 10 条展示 */}
      {comments.slice(0, 10).map((comment) => (
        <div key={comment.id} className="flex items-start justify-start gap-3 mb-2">
          <div className="relative mt-2 w-6 h-6 rounded-full overflow-hidden">
            <Image
              src={comment.user.images}
              alt="User Avatar"
              className="object-cover"
              sizes="100%"
              fill
            />
          </div>
          <div className="flex-1 overflow-hidden">
            <strong className="text-xs text-gray-600">{comment.user.nickname}</strong>
            <p className="text-gray-600 text-xs line-clamp-2">{comment.content}</p>
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

export const SaveAnalystToolResultMessage: FC<{
  result: SaveAnalystToolResult;
}> = ({ result: { analystId } }) => {
  return (
    <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg text-xs">
      🎉 保存成功！
      <Link href={`/analyst/${analystId}`} target="_blank" className="text-blue-500">
        点击查看研究主题
      </Link>
      <span className="ml-4 text-muted-foreground">这个功能还在开发中...</span>
    </div>
  );
};
