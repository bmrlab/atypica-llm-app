"use client";
import { Button } from "@/components/ui/button";
import { ScoutUserChat } from "@/data";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ScoutChatHistory } from "./ScoutChatHistory";
import { ScoutChatMessages } from "./ScoutChatMessages";

export function ScoutChat() {
  const router = useRouter();
  const [currentChat, setCurrentChat] = useState<ScoutUserChat | null>(null);

  return (
    <div className="flex flex-col items-stretch justify-between gap-4 max-w-5xl mx-auto h-dvh py-6">
      <div className="relative w-full">
        <div className="absolute left-0 top-1/2 -translate-y-1/2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            ← 返回
          </Button>
        </div>
        <h1 className="sm:text-lg font-medium px-18 text-center truncate">
          {currentChat?.title || "寻找目标用户"}
        </h1>
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <ScoutChatHistory onSelectChat={setCurrentChat} />
        </div>
      </div>
      <ScoutChatMessages scoutChat={currentChat} />
    </div>
  );
}
