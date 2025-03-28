import { RequestInteractionResult } from "@/tools/experts/interaction";
import { MessageCircleQuestionIcon } from "lucide-react";
import { FC } from "react";

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
