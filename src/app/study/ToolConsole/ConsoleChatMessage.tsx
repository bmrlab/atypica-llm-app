"use client";
import { BotIcon, UserIcon } from "@/components/icons";
import { Markdown } from "@/components/markdown";
import { cn } from "@/lib/utils";
import { Message as MessageType } from "ai";
import { motion } from "framer-motion";
import { CpuIcon } from "lucide-react";
import { PropsWithChildren, ReactNode } from "react";
import ToolInvocationMessage from "./ToolInvocationMessage";

const PlainText = ({ children }: PropsWithChildren) => {
  return (
    <div className="text-sm text-zinc-800 flex flex-col gap-4">
      <Markdown>{children as string}</Markdown>
    </div>
  );
};

export const ConsoleChatMessage = (message: {
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
      <div className={cn("size-[24px] flex flex-col justify-center items-center flex-shrink-0")}>
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
