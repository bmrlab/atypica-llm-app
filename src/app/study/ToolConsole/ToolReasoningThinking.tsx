import { Markdown } from "@/components/markdown";
import { cn } from "@/lib/utils";
import { ToolInvocation } from "ai";
import { BotIcon } from "lucide-react";
import { FC } from "react";

export const ToolReasoningThinking: FC<{
  toolInvocation: ToolInvocation;
}> = ({ toolInvocation }) => {
  return (
    <div>
      <div className="my-2 mx-1 text-sm">深度思考：{toolInvocation.args.question}</div>
      {toolInvocation.state === "result" ? (
        <div
          className={cn(
            "flex flex-rows items-start justify-start gap-2",
            "p-3 mb-3 text-gray-600 bg-gray-50 border border-gray-100 rounded-lg text-xs",
          )}
        >
          <BotIcon size={16} />
          <div className="flex-1 overflow-hidden">
            <div>{toolInvocation.result.reasoning}</div>
            <Markdown>{toolInvocation.result.text}</Markdown>
          </div>
        </div>
      ) : null}
    </div>
  );
};
