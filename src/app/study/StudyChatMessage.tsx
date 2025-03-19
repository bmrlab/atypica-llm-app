"use client";
import { Markdown } from "@/components/markdown";
import { cn } from "@/lib/utils";
import { Message as MessageType, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import { BotIcon, LoaderIcon } from "lucide-react";
import { PropsWithChildren, ReactNode } from "react";

const ToolInvocationMessage = ({ toolInvocation }: { toolInvocation: ToolInvocation }) => {
  const { toolName, args } = toolInvocation;
  return (
    <pre className="text-xs whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-lg p-2 font-mono">
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
      <div className="ml-2 mt-4 mb-2 font-bold">result</div>
      {toolInvocation.state === "result" ? (
        <div className="text-xs whitespace-pre-wrap p-2">{toolInvocation.result.plainText}</div>
      ) : (
        <div className="p-2">
          <LoaderIcon className="animate-spin" size={16} />
        </div>
      )}
    </pre>
  );
};

const PlainText = ({ children }: PropsWithChildren) => {
  return (
    <div className="text-sm text-zinc-800 flex flex-col gap-4">
      <Markdown>{children as string}</Markdown>
    </div>
  );
};

export const StudyChatMessage = (message: {
  nickname?: string;
  role: "assistant" | "user" | "system" | "data";
  content: string | ReactNode;
  parts?: MessageType["parts"];
}) => {
  const { nickname, role, content, parts } = message;

  return role === "user" ? (
    <div
      className={cn(
        "text-2xl font-medium w-full mt-8 mb-6",
        "not-first-of-type:border-t not-first-of-type:border-gray-100 not-first-of-type:pt-12",
      )}
    >
      {content}
    </div>
  ) : (
    <motion.div
      className={cn("flex flex-row gap-2 w-full")}
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <>
        <BotIcon size={24} />
        <div className="flex flex-col gap-6 flex-1 overflow-hidden px-3">
          {nickname && (
            <div className="leading-[24px] text-zinc-800 text-sm font-medium">{nickname}</div>
          )}
          {parts ? (
            <div className="flex flex-col gap-4">
              {parts.map((part, i) => {
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
      </>
    </motion.div>
  );
};
