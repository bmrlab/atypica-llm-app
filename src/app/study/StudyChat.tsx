"use client";
import { HomeIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { StudyUserChat } from "@/data";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChatBox } from "./ChatBox";
import { HistoryDrawer } from "./HistoryDrawer";
import { ToolConsole } from "./ToolConsole";

function Header({ studyChat }: { studyChat: StudyUserChat }) {
  const router = useRouter();
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
      <div className="absolute right-0 top-1/2 -translate-y-1/2">
        <HistoryDrawer
          onSelectChat={(studyChat) => {
            window.location.replace(`/study?id=${studyChat.id}`);
          }}
        />
      </div>
    </div>
  );
}

export function StudyChat({ studyChat }: { studyChat: StudyUserChat }) {
  return (
    <div className="flex flex-rows items-stretch justify-between w-full h-dvh py-6 overflow-hidden">
      <div className="w-1/2 flex flex-col items-stretch justify-between gap-4">
        <Header studyChat={studyChat} />
        <ChatBox studyChat={studyChat} />
      </div>
      <div className="w-1/2 flex flex-col items-stretch justify-between gap-4">
        <div
          className={cn(
            "ml-10 p-4 flex-1 overflow-hidden flex flex-col items-stretch justify-start gap-4",
            "border rounded-lg bg-gray-50",
          )}
        >
          <div className="ml-1 text-lg font-bold">Atypica 的电脑</div>
          <div className="p-4 flex-1 overflow-hidden border rounded-lg bg-white">
            <ToolConsole studyChat={studyChat} />
          </div>
        </div>
      </div>
    </div>
  );
}
