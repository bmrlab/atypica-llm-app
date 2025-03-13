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

const ToolArgs: FC<
  HTMLAttributes<HTMLPreElement> & {
    title: string;
    args: ToolInvocation["args"];
  }
> = ({ title, args, className }) => {
  return (
    <pre
      className={`text-xs whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-lg p-2 ${className}`}
    >
      <div className="ml-2 mt-1 font-bold">{title}</div>
      <table className="text-left mt-2">
        <tbody>
          {Object.entries(args).map(([key, value]) => (
            <tr key={key}>
              <td className="p-2 align-top">{key}:</td>
              <td className="p-2 whitespace-pre-wrap">
                {typeof value === "object"
                  ? JSON.stringify(value)
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
        <ToolArgs title={`正在执行 ${toolName}`} args={args} />
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
            <pre className="text-xs whitespace-pre-wrap">
              {JSON.stringify(result, null, 2)}
            </pre>
          );
      }
    };
    return (
      <div>
        <ToolArgs title={`${toolName} 执行结果`} args={args} className="mb-4" />
        {renderResult()}
      </div>
    );
  } else {
    return null;
  }
};

const PlainText = ({ children }: PropsWithChildren) => {
  return (
    <div className="text-xs text-zinc-800 dark:text-zinc-300 flex flex-col gap-4">
      <Markdown>{children as string}</Markdown>
    </div>
  );
};

export const ChatMessage = (message: {
  nickname?: string;
  role: string;
  content: string | ReactNode;
  parts: MessageType["parts"];
}) => {
  const { nickname, role, content, parts } = message;

  return (
    <motion.div
      className={`flex flex-row gap-4 px-4 w-full first-of-type:pt-20`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="size-[24px] flex flex-col justify-center items-center flex-shrink-0 text-zinc-400">
        {role === "assistant" ? <BotIcon /> : <UserIcon />}
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
