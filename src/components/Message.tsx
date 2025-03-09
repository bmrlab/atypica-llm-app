"use client";
import { motion } from "framer-motion";
import { BotIcon, UserIcon } from "./icons";
import { Markdown } from "./markdown";
import { ReactNode, PropsWithChildren } from "react";
import { StreamableValue, useStreamableValue } from "ai/rsc";
import { ToolInvocation, Message as MessageType } from "ai";
import {
  ReasoningThinkingResultMessage,
  XHSSearchResultMessage,
  XHSUserPostsResultMessage,
} from "@/tools/ui";

export const TextStreamMessage = ({
  content,
}: {
  content: StreamableValue;
}) => {
  const [text] = useStreamableValue(content);

  return (
    <motion.div
      className={`flex flex-row gap-4 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="size-[24px] flex flex-col justify-center items-center flex-shrink-0 text-zinc-400">
        <BotIcon />
      </div>

      <div className="flex flex-col gap-1 w-full">
        <div className="text-zinc-800 dark:text-zinc-300 flex flex-col gap-4">
          <Markdown>{text}</Markdown>
        </div>
      </div>
    </motion.div>
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
    const { toolName, toolCallId, args } = toolInvocation;
    return (
      <div key={toolCallId}>
        <div className="text-zinc-800 dark:text-zinc-300 flex flex-col gap-4">
          <pre className="text-xs whitespace-pre-wrap">
            正在执行 <strong>{toolName}</strong>({JSON.stringify(args)})
          </pre>
        </div>
      </div>
    );
  } else if (toolInvocation.state === "result") {
    const { toolName, toolCallId, args, result } = toolInvocation;
    return (
      <div key={toolCallId}>
        <pre className="text-xs my-2 whitespace-pre-wrap">
          <strong>{toolName}</strong>({JSON.stringify(args)}) 执行结果
        </pre>
        {toolName === "xhsSearch" ? (
          <XHSSearchResultMessage result={result} />
        ) : toolName === "xhsUserPosts" ? (
          <XHSUserPostsResultMessage result={result} />
        ) : toolName === "reasoningThinking" ? (
          <ReasoningThinkingResultMessage result={result} />
        ) : (
          <pre className="text-xs whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    );
  } else {
    return null;
  }
};

export const ChatMessage = (message: {
  nickname?: string;
  role: string;
  content: string | ReactNode;
  parts: MessageType["parts"];
}) => {
  const { nickname, role, parts } = message;

  const PlainText = ({ children }: PropsWithChildren) => {
    return (
      <div className="text-zinc-800 dark:text-zinc-300 flex flex-col gap-4 text-sm">
        <Markdown>{children as string}</Markdown>
      </div>
    );
  };

  return (
    <motion.div
      className={`flex flex-row gap-4 px-4 w-full first-of-type:pt-20`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="size-[24px] flex flex-col justify-center items-center flex-shrink-0 text-zinc-400">
        {role === "assistant" ? <BotIcon /> : <UserIcon />}
      </div>

      <div className="flex flex-col gap-6 w-full">
        {nickname && (
          <div className="leading-[24px] text-zinc-800 text-sm font-medium">
            {nickname}
          </div>
        )}
        {parts && (
          <div className="flex flex-col gap-4">
            {/* 目前先只保留最后5条用于避免页面越来越卡 */}
            {parts.slice(-5).map((part, i) => {
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
        )}
      </div>
    </motion.div>
  );
};
