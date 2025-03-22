"use client";
import { Button } from "@/components/ui/button";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { StudyUserChat } from "@/data";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, EyeIcon, EyeOffIcon, HomeIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ChatBox } from "./ChatBox";
import { ChatReplay } from "./ChatReplay";
import { StudyProvider, useStudyContext } from "./hooks/StudyContext";
import { ShareReplayButton } from "./ShareReplayButton";
import { ToolConsole } from "./ToolConsole/ToolConsole";

function Header({ studyChat }: { studyChat: StudyUserChat }) {
  const { replay } = useStudyContext();
  return (
    <div className="relative w-full">
      <div className="absolute left-0 top-1/2 -translate-y-1/2">
        <Button asChild variant="ghost" size="sm">
          <Link href="/">
            <HomeIcon size={16} /> 首页
          </Link>
        </Button>
      </div>
      <h1 className="sm:text-lg font-medium px-24 text-center truncate">
        {studyChat.title || "研究"}
      </h1>
      {!replay ? (
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <ShareReplayButton studyChat={studyChat} />
        </div>
      ) : null}
    </div>
  );
}

// 添加跟随状态切换按钮
const FollowButton = () => {
  const { viewToolInvocation, unsetViewToolInvocation } = useStudyContext();
  return (
    <Button
      onClick={() => unsetViewToolInvocation()}
      variant="ghost"
      size="sm"
      title={viewToolInvocation ? "停止跟随最新结果" : "跟随最新结果"}
    >
      {!viewToolInvocation ? <EyeIcon className="h-4 w-4" /> : <EyeOffIcon className="h-4 w-4" />}
      <span className="ml-1 text-xs">{!viewToolInvocation ? "自动跟随" : "手动选择"}</span>
    </Button>
  );
};

export function StudyPageClient({
  studyChat,
  readOnly,
  replay,
}: {
  studyChat: StudyUserChat;
  readOnly: boolean;
  replay: boolean;
}) {
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();
  const [consoleOpen, setConsoleOpen] = useState(false);
  return (
    <StudyProvider replay={replay}>
      <div
        className={cn(
          "relative",
          "flex flex-rows items-stretch justify-between w-full h-dvh overflow-hidden",
          "p-6 max-lg:p-3",
        )}
      >
        <div
          className={cn(
            "flex flex-col items-stretch justify-between gap-4",
            "w-1/2 max-lg:w-full max-lg:mb-14",
          )}
        >
          <Header studyChat={studyChat} />
          {replay ? (
            <ChatReplay studyChat={studyChat} />
          ) : (
            <ChatBox studyChat={studyChat} readOnly={readOnly} />
          )}
        </div>
        <div
          className={cn(
            "flex flex-col items-stretch justify-between gap-4",
            "w-1/2 max-lg:w-full max-lg:absolute max-lg:left-0 max-lg:right-0 max-lg:bottom-0",
            consoleOpen ? "max-lg:h-full max-lg:top-0" : "",
          )}
        >
          <div
            className={cn(
              "relative p-4 flex-1 overflow-hidden flex flex-col items-stretch justify-start",
              "border rounded-lg bg-gray-50 shadow-lg shadow-ring",
              "ml-10 max-lg:ml-0",
            )}
          >
            <div
              className="absolute w-full left-0 right-0 top-0 p-1 hidden max-lg:flex items-center justify-center"
              onClick={() => setConsoleOpen(!consoleOpen)}
            >
              {consoleOpen ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}
            </div>
            <div className="w-full flex flex-row items-center justify-start gap-4">
              <div className="ml-1 text-lg font-medium font-mono leading-tight">
                Atypica LLM Console
              </div>
              <div className="ml-auto"></div>
              <FollowButton />
            </div>
            <div
              className={cn(
                "p-4 flex-1 mt-4",
                !consoleOpen
                  ? "max-lg:p-0 max-lg:flex-none max-lg:h-0 max-lg:mt-0 max-lg:invisible"
                  : "",
                "overflow-auto border rounded-lg bg-white",
              )}
              ref={messagesContainerRef}
            >
              <ToolConsole />
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </div>
    </StudyProvider>
  );
}
