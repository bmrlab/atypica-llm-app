"use client";

import { motion } from "framer-motion";
import { BotIcon, UserIcon } from "./icons";
import { Markdown } from "./markdown";
import { ReactNode } from "react";
import { StreamableValue, useStreamableValue } from "ai/rsc";
import { ToolInvocation, Message as MessageType } from "ai";

import { XHSSearchResultMessage } from "@/tools/xiaohongshu/search";

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
  if (toolInvocation.state === "result") {
    const { toolName, toolCallId, result } = toolInvocation;
    return (
      <div key={toolCallId}>
        {toolName === "xhsSearch" ? (
          <XHSSearchResultMessage result={result} />
        ) : (
          <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
        )}
      </div>
    );
  }
  return null;
};

export const Message = ({
  role,
  // content,
  parts,
}: {
  role: string;
  content: string | ReactNode;
  parts: MessageType["parts"];
  // toolInvocations: Array<ToolInvocation> | undefined;
}) => {
  return (
    <motion.div
      className={`flex flex-row gap-4 px-4 w-full md:w-[500px] md:px-0 first-of-type:pt-20`}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div className="size-[24px] flex flex-col justify-center items-center flex-shrink-0 text-zinc-400">
        {role === "assistant" ? <BotIcon /> : <UserIcon />}
      </div>

      <div className="flex flex-col gap-6 w-full">
        {/* {content && (
          <div className="text-zinc-800 dark:text-zinc-300 flex flex-col gap-4">
            <Markdown>{content as string}</Markdown>
          </div>
        )} */}

        {parts && (
          <div className="flex flex-col gap-4">
            {parts.map((part, index) => {
              switch (part.type) {
                case "text":
                  return (
                    <div
                      key={index}
                      className="text-zinc-800 dark:text-zinc-300 flex flex-col gap-4 text-sm"
                    >
                      <Markdown>{part.text}</Markdown>
                    </div>
                  );
                case "reasoning":
                  return (
                    <div
                      key={index}
                      className="text-zinc-800 dark:text-zinc-300 flex flex-col gap-4 text-sm"
                    >
                      <Markdown>{part.reasoning}</Markdown>
                    </div>
                  );
                case "tool-invocation":
                  return (
                    <ToolInvocationMessage
                      key={index}
                      toolInvocation={part.toolInvocation}
                    />
                  );

                case "source":
                  return (
                    <div
                      key={index}
                      className="text-zinc-800 dark:text-zinc-300 flex flex-col gap-4 text-sm"
                    >
                      <Markdown>{JSON.stringify(part.source)}</Markdown>
                    </div>
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
