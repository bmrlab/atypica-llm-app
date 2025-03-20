import { fetchUserChatById } from "@/data";
import { fixChatMessages } from "@/lib/utils";
import { Message, ToolInvocation } from "ai";
import { useCallback, useEffect, useState } from "react";
import { StreamSteps } from "./StreamSteps";

const ScoutTaskChat = ({ toolInvocation }: { toolInvocation: ToolInvocation }) => {
  const chatId = toolInvocation.args.chatId as number;
  const [messages, setMessages] = useState<Message[]>([]);

  const fetchUpdate = useCallback(async () => {
    try {
      const updated = await fetchUserChatById(chatId, "scout");
      // 可能有异常的保存数据，取下来修复一下
      setMessages(fixChatMessages(updated.messages));
    } catch (error) {
      console.log("Error fetching userChat:", error);
    }
  }, [chatId]);

  // 添加定时器效果
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const poll = async () => {
      await fetchUpdate();
      timeoutId = setTimeout(poll, 5000);
    };
    poll();
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [fetchUpdate]);

  return (
    <div className="space-x-6 w-full">
      {messages.map((message) => (
        <StreamSteps
          key={`message-${message.id}`}
          role={message.role}
          content={message.content}
          parts={message.parts}
        ></StreamSteps>
      ))}
      {toolInvocation.state !== "result" && (
        <div className="w-full flex py-4 gap-px items-center justify-start text-zinc-500 text-xs font-mono">
          <span className="mr-2">Looking for target users </span>
          <span className="animate-bounce">✨ </span>
          {/* <span className="animate-bounce">·</span> */}
          {/* <span className="animate-bounce [animation-delay:0.2s]">·</span> */}
          {/* <span className="animate-bounce [animation-delay:0.4s]">·</span> */}
        </div>
      )}
    </div>
  );
};

export default ScoutTaskChat;
