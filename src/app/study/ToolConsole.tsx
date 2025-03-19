import { ScoutChatMessages } from "@/app/scout/ScoutChatMessages";
import { createUserChat, ScoutUserChat, StudyUserChat } from "@/data";
import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { useEffect, useMemo, useState } from "react";

export function ToolConsole({ studyChat }: { studyChat: StudyUserChat }) {
  const { messages } = useChat({
    // id 和 api 一起设置才能让 useChat 在组件之间共享状态
    id: `userChat-${studyChat.id}`,
    api: "/api/chat/study",
  });

  const lastToolResult = useMemo(() => {
    // 从后往前找到最后一个 tool result
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message.parts) {
        for (let j = message.parts.length - 1; j >= 0; j--) {
          const part = message.parts[j];
          if (part.type === "tool-invocation" && part.toolInvocation.state === "result") {
            return part.toolInvocation;
          }
        }
      }
    }
    return null;
  }, [messages]);

  // 监听最新的 tool result
  useEffect(() => {
    //
  }, [lastToolResult?.toolCallId]);

  const [scoutChat, setScoutChat] = useState<ScoutUserChat | null>(null);
  useEffect(() => {
    (async () => {
      const scoutChat = await createUserChat("scout", {
        role: "user",
        content: "巧克力",
      });
      setScoutChat(scoutChat);
    })();
  }, []);

  return (
    <div
      className={cn(
        "ml-10 p-4 flex-1 overflow-hidden flex flex-col items-stretch justify-start gap-4",
        "border rounded-lg bg-gray-50",
      )}
    >
      <div className="ml-1 text-lg font-bold">Atypica 的电脑</div>
      <div
        className={cn(
          "p-4 flex-1 overflow-hidden flex flex-col items-stretch justify-start gap-4",
          "border rounded-lg bg-white",
        )}
      >
        {scoutChat && <ScoutChatMessages scoutChat={scoutChat} autoChat={true} />}
      </div>
    </div>
  );
}
