"use client";
// 给 chat 类型的 tool call 用的组件，比如 scout chat 和 interview chat
import { Markdown } from "@/components/markdown";
import {
  ReasoningThinkingResultMessage,
  SaveAnalystToolResultMessage,
  XHSNoteCommentsResultMessage,
  XHSSearchResultMessage,
  XHSUserNotesResultMessage,
} from "@/components/ToolMessage";
import { cn } from "@/lib/utils";
import { ToolName } from "@/tools";
import { Message as MessageType, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import { BotIcon, CpuIcon, LoaderIcon, UserIcon } from "lucide-react";
import { PropsWithChildren, ReactNode } from "react";

const PlainText = ({ children }: PropsWithChildren) => {
  return (
    <div className="text-sm text-zinc-800 flex flex-col gap-4">
      <Markdown>{children as string}</Markdown>
    </div>
  );
};

const StreamStep = ({ toolInvocation }: { toolInvocation: ToolInvocation }) => {
  return (
    <div className={cn("text-xs whitespace-pre-wrap p-2 font-mono")}>
      <div className="ml-1 my-2 font-bold">exec {toolInvocation.toolName}</div>
      <div className="ml-1 mt-1 mb-1 text-gray-500">&gt;_ args</div>
      <table className="text-left">
        <tbody>
          {Object.entries(toolInvocation.args).map(([key, value]) => (
            <tr key={key}>
              <td className="p-1 align-top">{key}:</td>
              <td className="p-1 whitespace-pre-wrap">
                {typeof value === "object" ? JSON.stringify(value, null, 2) : value?.toString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="ml-1 mt-2 mb-2 text-gray-500">&gt;_ result</div>
      {toolInvocation.state === "result" ? (
        (() => {
          switch (toolInvocation.toolName) {
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
        })()
      ) : (
        <div className="p-1">
          <LoaderIcon className="animate-spin" size={16} />
        </div>
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
      className={cn(
        "flex flex-col gap-4 w-full",
        role === "user"
          ? "bg-blue-50/50 border-r-4 border-blue-200 pr-2 py-4 pl-4 rounded-l-lg"
          : role === "system"
            ? "bg-green-50/50 p-4 rounded-lg"
            : "",
      )}
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div
        className={cn(
          "flex gap-2 justify-start items-center flex-shrink-0",
          role === "user" ? "flex-row-reverse" : "flex-row",
        )}
      >
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
