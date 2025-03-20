"use client";
// 给 chat 类型的 tool call 用的组件，比如 scout chat 和 interview chat
import { Markdown } from "@/components/markdown";
import { cn } from "@/lib/utils";
import { ToolName } from "@/tools";
import {
  ReasoningThinkingResultMessage,
  SaveAnalystToolResultMessage,
  XHSNoteCommentsResultMessage,
  XHSSearchResultMessage,
  XHSUserNotesResultMessage,
} from "@/tools/ui/ToolMessage";
import { Message as MessageType, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import { BotIcon, CpuIcon, UserIcon } from "lucide-react";
import { PropsWithChildren, ReactNode } from "react";

const PlainText = ({ children }: PropsWithChildren) => {
  return (
    <div className="text-sm text-zinc-800 flex flex-col gap-4">
      <Markdown>{children as string}</Markdown>
    </div>
  );
};

const StreamStep = ({ toolInvocation }: { toolInvocation: ToolInvocation }) => {
  const { toolName, args } = toolInvocation;
  return (
    <div>
      <pre
        className={cn(
          "text-xs whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-lg p-2 font-mono",
        )}
      >
        <div className="ml-2 mt-1 mb-2 font-bold">{toolName} exec args</div>
        <table className="text-left">
          <tbody>
            {Object.entries(args).map(([key, value]) => (
              <tr key={key}>
                <td className="p-2 align-top">{key}:</td>
                <td className="p-2 whitespace-pre-wrap">
                  {typeof value === "object" ? JSON.stringify(value, null, 2) : value?.toString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </pre>
      {toolInvocation.state === "result" && (
        <>
          <div className="text-sm text-zinc-800 my-4">执行结果</div>
          {(() => {
            switch (toolName) {
              case ToolName.xhsSearch:
                return <XHSSearchResultMessage result={toolInvocation.result} />;
              case ToolName.xhsUserNotes:
                return <XHSUserNotesResultMessage result={toolInvocation.result} />;
              case ToolName.xhsNoteComments:
                return <XHSNoteCommentsResultMessage result={toolInvocation.result} />;
              case ToolName.reasoningThinking:
                return <ReasoningThinkingResultMessage result={toolInvocation.result} />;
              case ToolName.saveAnalyst:
                return <SaveAnalystToolResultMessage result={toolInvocation.result} />;
              default:
                return (
                  <pre className="text-xs font-mono whitespace-pre-wrap p-4 text-muted-foreground bg-gray-50 border border-gray-100 rounded-lg">
                    {toolInvocation.result.plainText ?? "-"}
                  </pre>
                );
            }
          })()}
        </>
      )}
    </div>
  );
};

export const StreamSteps = (message: {
  nickname?: string;
  role: "assistant" | "user" | "system" | "data";
  content: string | ReactNode;
  parts?: MessageType["parts"];
}) => {
  const { nickname, role, content, parts } = message;

  return (
    <motion.div
      className={cn("flex flex-col gap-4 w-full")}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className={cn("flex flex-row gap-2 justify-start items-center flex-shrink-0")}>
        {role === "user" ? (
          <UserIcon size={24} />
        ) : role === "assistant" ? (
          <BotIcon size={24} />
        ) : role === "system" ? (
          <CpuIcon size={24} />
        ) : null}
        {nickname && (
          <div className="leading-[24px] text-zinc-800 text-sm font-medium">{nickname}</div>
        )}
      </div>

      <div className="flex flex-col gap-6 flex-1 overflow-hidden">
        {parts ? (
          <div className="flex flex-col gap-4">
            {parts.map((part, i) => {
              // 小红书搜索任务之类的，是多个 step 一起显示，搜索结果和总结，所以需要显示超过1条在一起，更好
              switch (part.type) {
                case "text":
                  return <PlainText key={i}>{part.text}</PlainText>;
                case "reasoning":
                  return <PlainText key={i}>{part.reasoning}</PlainText>;
                case "source":
                  return <PlainText key={i}>{JSON.stringify(part.source)}</PlainText>;
                case "tool-invocation":
                  return <StreamStep key={i} toolInvocation={part.toolInvocation} />;
                default:
                  return null;
              }
            })}
          </div>
        ) : (
          <PlainText>{content}</PlainText>
        )}
      </div>
    </motion.div>
  );
};
