"use client";
import { Markdown } from "@/components/markdown";
import ToolArgsTable from "@/components/ToolArgsTable";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ToolName } from "@/tools";
import { Message as MessageType, ToolInvocation } from "ai";
import { motion } from "framer-motion";
import { BotIcon, ChevronRight, EyeIcon, LoaderIcon, XIcon } from "lucide-react";
import { PropsWithChildren, ReactNode, useEffect, useRef, useState } from "react";
import { useStudyContext } from "./hooks/StudyContext";
import { GenerateReportResultMessage } from "./tools/message/GenerateReportResultMessage";
import { RequestIteractionResultMessage } from "./tools/message/RequestIteractionResultMessage";

const ToolInvocationMessage = ({
  toolInvocation,
  onUserReply,
  isLastPart,
}: {
  toolInvocation: ToolInvocation;
  onUserReply?: (content: string) => void;
  isLastPart?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const { setViewToolInvocation, setLastToolInvocation } = useStudyContext();

  useEffect(() => {
    if (isLastPart) {
      setLastToolInvocation(toolInvocation);
    }
  }, [toolInvocation, setLastToolInvocation, isLastPart]);

  const prevIsLastPartRef = useRef(isLastPart);
  useEffect(() => {
    if (isLastPart) {
      setOpen(true);
    } else if (prevIsLastPartRef.current && !isLastPart) {
      setOpen(false);
    }
  }, [isLastPart]);

  return (
    <div>
      <Collapsible
        className={cn(
          "text-xs whitespace-pre-wrap rounded-lg p-2 font-mono",
          "bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700/50",
        )}
        open={open}
        onOpenChange={setOpen}
      >
        <CollapsibleTrigger className="w-full flex items-center gap-1 hover:opacity-90 group">
          <ChevronRight className="h-3 w-3 transition-transform group-data-[state=open]:rotate-90 text-primary" />
          <div className="ml-1 my-2 font-bold text-xs text-primary">
            exec {toolInvocation.toolName}
          </div>
          <div
            className="text-foreground/70 ml-auto mr-2 p-2 hover:bg-zinc-100 hover:dark:bg-zinc-900 rounded-md"
            onClick={(e) => {
              e.stopPropagation();
              setViewToolInvocation(toolInvocation);
            }}
          >
            <EyeIcon className="size-3.5" />
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-4">
          <div className="ml-1 mt-1 mb-1 text-primary">&gt;_ args</div>
          <ToolArgsTable toolInvocation={toolInvocation} />
          <div className="ml-1 mt-2 mb-1 text-primary w-full">&gt;_ result</div>
          {toolInvocation.state === "result" ? (
            // <div className="text-xs whitespace-pre-wrap p-1">{toolInvocation.result.plainText}</div>
            <table className="text-left">
              <tbody>
                {Object.entries(toolInvocation.result).map(([key, value]) => (
                  <tr key={key}>
                    <td className="p-1 align-top">{key}:</td>
                    {key === "plainText" ? (
                      <td className="p-1 whitespace-pre-wrap">
                        {/* 随便设置个最大宽度，因为 table 是撑满的，最终还是撑满，但是不会超出 */}
                        {value?.toString()}
                      </td>
                    ) : (
                      <td className="p-1 whitespace-pre-wrap">
                        {typeof value === "object"
                          ? JSON.stringify(value, null, 2)
                          : value?.toString()}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-1">
              <LoaderIcon className="animate-spin" size={16} />
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
      {toolInvocation.state === "result" &&
        (() => {
          switch (toolInvocation.toolName) {
            case ToolName.requestInteraction:
              return (
                <RequestIteractionResultMessage
                  result={toolInvocation.result}
                  onSelectAnswer={(content) => {
                    if (onUserReply) onUserReply(content);
                  }}
                />
              );
            case ToolName.generateReport:
              return <GenerateReportResultMessage result={toolInvocation.result} />;
            default:
              return null;
          }
        })()}
    </div>
  );
};

const PlainText = ({ children }: PropsWithChildren) => {
  return (
    <div className="text-sm flex flex-col gap-4">
      <Markdown>{children as string}</Markdown>
    </div>
  );
};

export const SingleMessage = ({
  avatar,
  nickname,
  role,
  content,
  parts,
  onDelete,
  onUserReply,
  isLastMessage,
}: {
  avatar?: Partial<{ user: ReactNode; assistant: ReactNode; system: ReactNode }>;
  nickname?: string;
  role: "assistant" | "user" | "system" | "data";
  content: string | ReactNode;
  parts?: MessageType["parts"];
  onDelete?: () => void;
  onUserReply?: (content: string) => void;
  isLastMessage?: boolean;
}) => {
  if (role === "user") {
    const contentLength = (content?.toString() ?? "").length;
    return (
      <div
        className={cn(
          "w-full mt-8 mb-6 flex items-center justify-between",
          "not-first-of-type:border-t not-first-of-type:border-zinc-100 not-first-of-type:dark:border-zinc-700/50 not-first-of-type:pt-12",
        )}
      >
        <span
          className={cn(
            contentLength < 20
              ? "text-2xl"
              : contentLength < 50
                ? "text-xl"
                : contentLength < 80
                  ? "text-lg"
                  : contentLength < 100
                    ? "text-base"
                    : "text-sm",
            "font-medium",
          )}
        >
          {content}
        </span>
        {onDelete ? (
          <div
            className="p-2 text-muted-foreground hover:text-muted-foreground/50 mr-4"
            onClick={() => onDelete()}
          >
            <XIcon className="w-4 h-4" />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <motion.div
      className={cn("flex flex-row gap-2 w-full")}
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {avatar?.assistant || <BotIcon className="size-6" />}
      <div className="flex flex-col gap-6 flex-1 overflow-hidden">
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
                  return (
                    <ToolInvocationMessage
                      key={i}
                      toolInvocation={part.toolInvocation}
                      isLastPart={isLastMessage && i === parts.length - 1}
                      onUserReply={onUserReply}
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
