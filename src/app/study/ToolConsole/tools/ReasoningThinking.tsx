import HippyGhostAvatar from "@/components/HippyGhostAvatar";
import { Markdown } from "@/components/markdown";
import { cn } from "@/lib/utils";
import { ToolInvocation } from "ai";
import { useTranslations } from "next-intl";
import { FC } from "react";

const ReasoningThinking: FC<{
  toolInvocation: ToolInvocation;
}> = ({ toolInvocation }) => {
  const t = useTranslations("StudyPage.ToolConsole");
  return (
    <div>
      <div className="my-2 mx-1 text-sm">
        {t("deepThinking")}: {toolInvocation.args.question}
      </div>
      {toolInvocation.state === "result" ? (
        <div
          className={cn(
            "flex flex-rows items-start justify-start gap-2",
            "p-3 mb-3 text-foreground/70 bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 rounded-lg text-xs",
          )}
        >
          <HippyGhostAvatar seed={toolInvocation.toolCallId} className="size-6" />
          <div className="flex-1 overflow-hidden">
            <div>{toolInvocation.result.reasoning}</div>
            <Markdown>{toolInvocation.result.text}</Markdown>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ReasoningThinking;
