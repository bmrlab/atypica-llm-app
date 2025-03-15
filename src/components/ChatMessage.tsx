"use client";
import { motion } from "framer-motion";
import { BotIcon, UserIcon } from "./icons";
import { Markdown } from "./markdown";
import { ReactNode, PropsWithChildren, FC, HTMLAttributes } from "react";
import { ToolInvocation, Message as MessageType } from "ai";
import {
  ReasoningThinkingResultMessage,
  XHSNoteCommentsResultMessage,
  XHSSearchResultMessage,
  XHSUserNotesResultMessage,
} from "@/tools/ui/tool-message";
import { CpuIcon } from "lucide-react";

const ToolArgs: FC<
  HTMLAttributes<HTMLPreElement> & {
    toolName: string;
    args: ToolInvocation["args"];
  }
> = ({ toolName, args, className }) => {
  return (
    <pre
      className={`text-xs whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-lg p-2 ${className}`}
    >
      <div className="ml-2 mt-1 font-bold">{toolName} 执行参数</div>
      <table className="text-left mt-2">
        <tbody>
          {Object.entries(args).map(([key, value]) => (
            <tr key={key}>
              <td className="p-2 align-top">{key}:</td>
              <td className="p-2 whitespace-pre-wrap">
                {typeof value === "object"
                  ? JSON.stringify(value, null, 2)
                  : value?.toString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </pre>
  );
};

const ToolInvocationMessage = ({
  toolInvocation,
}: {
  toolInvocation: ToolInvocation;
}) => {
  if (
    toolInvocation.state === "call" ||
    toolInvocation.state === "partial-call"
  ) {
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
        case "xhsSearch":
          return <XHSSearchResultMessage result={result} />;
        case "xhsUserNotes":
          return <XHSUserNotesResultMessage result={result} />;
        case "xhsNoteComments":
          return <XHSNoteCommentsResultMessage result={result} />;
        case "reasoningThinking":
          return <ReasoningThinkingResultMessage result={result} />;
        default:
          return (
            <pre className="text-xs whitespace-pre-wrap p-4 text-muted-foreground bg-gray-50 border border-gray-100 rounded-lg">
              {toolName} {JSON.stringify(result)}
            </pre>
          );
      }
    };
    return (
      <div>
        <ToolArgs toolName={toolName} args={args} />
        <div className="text-sm text-zinc-800 my-4">执行结果：</div>
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
}) => {
  const { nickname, role, content, parts } = message;

  return (
    <motion.div
      className={`flex flex-row gap-4 px-4 w-full first-of-type:mt-10 py-4
        ${
          role === "user"
            ? "bg-blue-50/50 border-l-4 border-blue-200"
            : role === "assistant"
              ? "bg-gray-50/50 border-l-4 border-gray-200"
              : role === "system"
                ? "bg-green-50/50 border-l-4 border-green-200"
                : ""
        }`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div
        className={`size-[24px] flex flex-col justify-center items-center flex-shrink-0 ${
          role === "user"
            ? "text-blue-500"
            : role === "assistant"
              ? "text-gray-500"
              : role === "system"
                ? "text-green-500"
                : ""
        }`}
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
          <div className="leading-[24px] text-zinc-800 text-sm font-medium">
            {nickname}
          </div>
        )}
        {parts ? (
          <div className="flex flex-col gap-4">
            {parts.map((part, i) => {
              switch (part.type) {
                case "text":
                  return <PlainText key={i}>{part.text}</PlainText>;
                case "reasoning":
                  return <PlainText key={i}>{part.reasoning}</PlainText>;
                case "source":
                  return (
                    <PlainText key={i}>{JSON.stringify(part.source)}</PlainText>
                  );
                case "tool-invocation":
                  return (
                    <ToolInvocationMessage
                      key={i}
                      toolInvocation={part.toolInvocation}
                    />
                  );
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
