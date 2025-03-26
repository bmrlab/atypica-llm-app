import { Markdown } from "@/components/markdown";
import { cn } from "@/lib/utils";
import { RequestInteractionResult } from "@/tools/experts/interaction";
import { ReasoningThinkingResult } from "@/tools/experts/reasoning";
import { SaveAnalystToolResult } from "@/tools/system/saveAnalyst";
import { XHSNoteCommentsResult } from "@/tools/xhs/noteComments";
import { XHSSearchResult } from "@/tools/xhs/search";
import { XHSUserNotesResult } from "@/tools/xhs/userNotes";
import { MessageCircleQuestionIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FC } from "react";
// import { ImageCarousel } from "./ImageCarousel";

export const XHSSearchResultMessage: FC<{ result: XHSSearchResult }> = ({ result: { notes } }) => {
  return (
    <div
      className={cn(
        "flex flex-row gap-3 w-full overflow-x-scroll p-3 rounded-md",
        "bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800",
      )}
    >
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
              <div className="text-xs text-foreground/80 line-clamp-1">{note.user.nickname}</div>
            </div>
            <h3 className="font-medium text-xs line-clamp-1">{note.title}</h3>
            <p className="text-foreground/80 text-xs mt-1 line-clamp-2">{note.desc}</p>
            {/* <div>{note.id}</div> */}
            {/* <div className="text-foreground/80 text-xs mt-1">评论数：{note.comments_count}</div> */}
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
    <div
      className={cn(
        "flex flex-row gap-3 w-full overflow-x-scroll p-3 rounded-md",
        "bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800",
      )}
    >
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
              <div className="text-xs text-foreground/80 line-clamp-1">{note.user.nickname}</div>
            </div>
            <h3 className="font-medium text-xs line-clamp-1">{note.title}</h3>
            <p className="text-foreground/80 text-xs mt-1 line-clamp-2">{note.desc}</p>
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
    <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-md">
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
            <strong className="text-xs text-foreground/80">{comment.user.nickname}</strong>
            <p className="text-foreground/80 text-xs line-clamp-2">{comment.content}</p>
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
    <div className="p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-lg text-xs">
      <div className="text-foreground/80 mb-3">{reasoning}</div>
      <Markdown>{text}</Markdown>
    </div>
  );
};

export const SaveAnalystToolResultMessage: FC<{
  result: SaveAnalystToolResult;
}> = ({ result: { analystId } }) => {
  return (
    <div className="p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-lg text-xs">
      🎉 保存成功！
      <Link href={`/analyst/${analystId}`} target="_blank" className="text-blue-500">
        点击查看研究主题
      </Link>
      <span className="ml-4 text-muted-foreground">这个功能还在开发中...</span>
    </div>
  );
};

export const RequestIteractionResultMessage: FC<{
  result: RequestInteractionResult;
  onSelectAnswer: (answer: string) => void;
}> = ({ result: { question, options }, onSelectAnswer }) => {
  return (
    <div className="p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-lg">
      <div className="text-sm text-foreground/80 mb-3 flex items-center justify-start gap-1">
        <strong>{question}</strong>
        <MessageCircleQuestionIcon className="size-4" />
      </div>
      <div className="flex flex-col gap-2">
        {options.map((option, index) => (
          <div
            key={index}
            onClick={() => onSelectAnswer(option)}
            className="text-xs p-2 rounded-md border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
          >
            {option}
          </div>
        ))}
      </div>
    </div>
  );
};
