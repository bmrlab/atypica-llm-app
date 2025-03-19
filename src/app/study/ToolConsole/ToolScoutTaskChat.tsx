import { fetchUserChatById, ScoutUserChat } from "@/data";
import { Message } from "ai";
import { useCallback, useEffect, useState } from "react";
import { ConsoleChatMessage } from "./ConsoleChatMessage";

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
        <ConsoleChatMessage
          key={`message-${message.id}`}
          role={message.role}
          content={message.content}
          parts={message.parts}
        ></ConsoleChatMessage>
      ))}
      <div className="w-full flex gap-1 py-4 items-center justify-start">
        <span className="animate-bounce">·</span>
        <span className="animate-bounce [animation-delay:0.2s]">·</span>
        <span className="animate-bounce [animation-delay:0.4s]">·</span>
        <span className="text-zinc-500 text-sm">Atypica LLM ✨ is Working</span>
      </div>
    </div>
  );
};

export default ToolScoutTaskChat;
