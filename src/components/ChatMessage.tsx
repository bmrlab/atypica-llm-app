"use client";
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
import { FC, HTMLAttributes, PropsWithChildren, ReactNode } from "react";
import { Markdown } from "./markdown";

const ToolArgs: FC<
  HTMLAttributes<HTMLPreElement> & {
    toolName: string;
    args: ToolInvocation["args"];
  }
> = ({ toolName, args, className }) => {
  return (
    <pre
      className={cn(
        "text-xs whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-lg p-2 font-mono",
        className,
      )}
    >
      <div className="ml-2 mt-1 font-bold">{toolName} 执行参数</div>
      <table className="text-left mt-2">
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
  );
};

const ToolInvocationMessage = ({ toolInvocation }: { toolInvocation: ToolInvocation }) => {
  if (toolInvocation.state === "call" || toolInvocation.state === "partial-call") {
    const { toolName, args } = toolInvocation;
    return (
      <div>
        {/* 正在执行  */}
        <ToolArgs toolName={toolName} args={args} />
      </div>
    );
  } else if (toolInvocation.state === "result") {
    const { toolName, args, result } = toolInvocation;
    const renderResult = () => {
      switch (toolName) {
        case ToolName.xhsSearch:
          return <XHSSearchResultMessage result={result} />;
        case ToolName.xhsUserNotes:
          return <XHSUserNotesResultMessage result={result} />;
        case ToolName.xhsNoteComments:
          return <XHSNoteCommentsResultMessage result={result} />;
        case ToolName.reasoningThinking:
          return <ReasoningThinkingResultMessage result={result} />;
        case ToolName.saveAnalyst:
          return <SaveAnalystToolResultMessage result={result} />;
        default:
          return (
            <pre className="text-xs whitespace-pre-wrap p-4 text-muted-foreground bg-gray-50 border border-gray-100 rounded-lg font-mono">
              {result.plainText ?? "-"}
            </pre>
          );
      }
    };
    return (
      <div>
        <ToolArgs toolName={toolName} args={args} />
        <div className="text-sm text-zinc-800 my-4">执行结果</div>
        {renderResult()}
      </div>
    );
  } else {
    return null;
  }
};

const PlainText = ({ children }: PropsWithChildren) => {
  return (
    <div className="text-sm text-zinc-800 flex flex-col gap-4">
      <Markdown>{children as string}</Markdown>
    </div>
  );
};

export const ChatMessage = (message: {
  nickname?: string;
  role: "assistant" | "user" | "system" | "data";
  content: string | ReactNode;
  parts?: MessageType["parts"];
  environment?: "console" | "chat";
}) => {
  const { nickname, role, content, parts, environment = "chat" } = message;

  return (
    <motion.div
      className={cn(
        "flex flex-row gap-4 px-4 w-full first-of-type:mt-10 py-4",
        role === "user"
          ? "bg-blue-50/50 border-r-4 border-blue-200 flex-row-reverse"
          : role === "assistant"
            ? "bg-gray-50/50 border-l-4 border-gray-200"
            : role === "system"
              ? "bg-green-50/50 border-l-4 border-green-200"
              : "",
        environment === "console" ? "flex-col border-l-0 border-r-0" : "",
      )}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div
        className={cn(
          "size-[24px] flex flex-col justify-center items-center flex-shrink-0",
          role === "user"
            ? "text-blue-500"
            : role === "assistant"
              ? "text-gray-500"
              : role === "system"
                ? "text-green-500"
                : "",
        )}
      >
        {role === "user" ? (
          <UserIcon />
        ) : role === "assistant" ? (
          <BotIcon />
        ) : role === "system" ? (
          <CpuIcon />
        ) : null}
      </div>

      <div className="flex flex-col gap-6 flex-1 overflow-hidden">
        {nickname && (
          <div className="leading-[24px] text-zinc-800 text-sm font-medium">{nickname}</div>
        )}
        {parts ? (
          <div className="flex flex-col gap-4">
            {(environment === "console" ? parts.slice(-1) : parts).map((part, i) => {
              // 如果是控制台环境，只显示最后一条
              switch (part.type) {
                case "text":
                  return <PlainText key={i}>{part.text}</PlainText>;
                case "reasoning":
                  return <PlainText key={i}>{part.reasoning}</PlainText>;
                case "source":
                  return <PlainText key={i}>{JSON.stringify(part.source)}</PlainText>;
                case "tool-invocation":
                  return <ToolInvocationMessage key={i} toolInvocation={part.toolInvocation} />;
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
