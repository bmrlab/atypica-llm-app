"use client";
import { Button } from "@/components/ui/button";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { StudyUserChat } from "@/data";
import { cn } from "@/lib/utils";
import { EyeIcon, EyeOffIcon, HomeIcon } from "lucide-react";
import Link from "next/link";
import { StudyChatBox } from "./StudyChatBox";
import { ToolConsole } from "./ToolConsole/ToolConsole";
import { StudyProvider, useStudyContext } from "./hooks";

function Header({ studyChat }: { studyChat: StudyUserChat }) {
  return (
    <div className="relative w-full">
      <div className="absolute left-0 top-1/2 -translate-y-1/2">
        {/* <Button variant="ghost" size="sm" onClick={() => router.back()}>
          ← 返回
        </Button> */}
        <Button asChild variant="ghost" size="sm">
          <Link href="/">
            <HomeIcon size={16} /> 首页
          </Link>
        </Button>
      </div>
      <h1 className="sm:text-lg font-medium px-18 text-center truncate">
        {studyChat?.title || "研究"}
      </h1>
      {/* <div className="absolute right-0 top-1/2 -translate-y-1/2">
        <HistoryDrawer
          onSelectChat={(studyChat) => {
            window.location.replace(`/study?id=${studyChat.id}`);
          }}
        />
      </div> */}
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

export function StudyChat({
  studyChat,
  readOnly,
}: {
  studyChat: StudyUserChat;
  readOnly: boolean;
}) {
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();
  return (
    <StudyProvider>
      <div className="flex flex-rows items-stretch justify-between w-full h-dvh p-6 overflow-hidden">
        <div className="w-1/2 flex flex-col items-stretch justify-between gap-4">
          <Header studyChat={studyChat} />
          <StudyChatBox studyChat={studyChat} readOnly={readOnly} />
        </div>
        <div className="w-1/2 flex flex-col items-stretch justify-between gap-4">
          <div
            className={cn(
              "ml-10 p-4 flex-1 overflow-hidden flex flex-col items-stretch justify-start gap-4",
              "border rounded-lg bg-gray-50 shadow-lg shadow-ring",
            )}
          >
            <div className="w-full flex flex-row items-center justify-between">
              <div className="ml-1 text-lg font-medium font-mono">Atypica LLM Console</div>
              <FollowButton />
            </div>
            <div
              className="p-4 flex-1 overflow-auto border rounded-lg bg-white"
              ref={messagesContainerRef}
            >
              <ToolConsole studyChat={studyChat} />
              <div ref={messagesEndRef} />
            </div>
          </div>
        </div>
      </div>
    </StudyProvider>
  );
}
