"use client";
import { Markdown } from "@/components/markdown";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { Message as MessageType, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import { BotIcon, ChevronRight, EyeIcon, LoaderIcon } from "lucide-react";
import { PropsWithChildren, ReactNode, useEffect } from "react";
import { useStudyContext } from "./hooks/StudyContext";

const ToolInvocationMessage = ({ toolInvocation }: { toolInvocation: ToolInvocation }) => {
  const { toolName, args } = toolInvocation;
  const { setViewToolInvocation, setLastToolInvocation } = useStudyContext();

  useEffect(() => {
    setLastToolInvocation(toolInvocation);
  }, [toolInvocation, setLastToolInvocation]);

  return (
    <pre className="text-xs whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-lg p-2 font-mono">
      <Collapsible className="w-full">
        <CollapsibleTrigger className="w-full flex items-center gap-1 text-xs font-bold hover:underline group">
          <ChevronRight className="h-3 w-3 transition-transform group-data-[state=open]:rotate-90" />
          <div className="ml-1 my-2 font-bold">exec {toolName}</div>
          <div
            className="text-gray-400 ml-auto mr-2 p-2 hover:bg-gray-100 rounded-md"
            onClick={(e) => {
              e.stopPropagation();
              setViewToolInvocation(toolInvocation);
            }}
          >
            <EyeIcon className="size-3.5" />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-5">
          <div className="ml-1 mt-1 mb-1 text-gray-500">&gt;_ args</div>
          <table className="text-left">
            <tbody>
              {Object.entries(args).map(([key, value]) => (
                <tr key={key}>
                  <td className="p-1 align-top">{key}:</td>
                  <td className="p-1 whitespace-pre-wrap">
                    {typeof value === "object" ? JSON.stringify(value, null, 2) : value?.toString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="ml-1 mt-2 mb-1 text-gray-500">&gt;_ result</div>
          {toolInvocation.state === "result" ? (
            <div className="text-xs whitespace-pre-wrap p-1">{toolInvocation.result.plainText}</div>
          ) : (
            <div className="p-1">
              <LoaderIcon className="animate-spin" size={16} />
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
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

export const SingleMessage = (message: {
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
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
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
