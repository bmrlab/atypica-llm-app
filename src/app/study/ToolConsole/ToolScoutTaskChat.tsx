import { fetchUserChatById, ScoutUserChat } from "@/data";
import { Message } from "ai";
import { useCallback, useEffect, useState } from "react";
import { ToolSteps } from "./ToolSteps";

const ToolScoutTaskChat = ({ chatId }: { chatId: number }) => {
  const [userChat, setUserChat] = useState<ScoutUserChat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const fetchUpdate = useCallback(async () => {
    try {
      const updated = await fetchUserChatById(chatId, "scout");
      setMessages(updated.messages);
      setUserChat(updated);
    } catch (error) {
      console.log("Error fetching userChat:", error);
    }
  }, [chatId]);

  // 添加定时器效果
  useEffect(() => {
    const intervalId: NodeJS.Timeout = setInterval(fetchUpdate, 1000);
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchUpdate]);

  return (
    <div className="space-x-6 w-full">
      {messages.slice(-1).map((message) => (
        <ToolSteps
          key={`message-${message.id}`}
          role={message.role}
          content={message.content}
          parts={message.parts}
        ></ToolSteps>
      ))}
      <div className="w-full flex py-4 gap-px items-center justify-start text-zinc-500 text-sm">
        {/* <span className="animate-bounce">·</span> */}
        {/* <span className="animate-bounce [animation-delay:0.2s]">·</span> */}
        {/* <span className="animate-bounce [animation-delay:0.4s]">·</span> */}
        <span className="mr-2">Atypica LLM </span>
        <span className="animate-bounce">✨ </span>
        <span className="animate-bounce [animation-delay:0.05s]">i</span>
        <span className="animate-bounce [animation-delay:0.10s]">s</span>
        <span className="animate-bounce [animation-delay:0.15s]">W</span>
        <span className="animate-bounce [animation-delay:0.20s]">o</span>
        <span className="animate-bounce [animation-delay:0.25s]">r</span>
        <span className="animate-bounce [animation-delay:0.30s]">k</span>
        <span className="animate-bounce [animation-delay:0.35s]">i</span>
        <span className="animate-bounce [animation-delay:0.40s]">n</span>
        <span className="animate-bounce [animation-delay:0.45s]">g</span>
      </div>
    </div>
  );
};

export default ToolScoutTaskChat;
