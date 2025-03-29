import HippyGhostAvatar from "@/components/HippyGhostAvatar";
import { fetchUserChatById } from "@/data";
import { ToolName } from "@/tools";
import { Message, ToolInvocation } from "ai";
import { useCallback, useEffect, useState } from "react";
import { useStudyContext } from "../../hooks/StudyContext";
import { consoleStreamWaitTime, useProgressiveMessages } from "../../hooks/useProgressiveMessages";
import { StreamSteps } from "./StreamSteps";

const ScoutTaskChat = ({ toolInvocation }: { toolInvocation: ToolInvocation }) => {
  const scoutUserChatId = (toolInvocation.args.scoutUserChatId ||
    toolInvocation.args.chatId) as number; // 需要兼容老的 tool 参数: chatId
  const [messages, setMessages] = useState<Message[]>([]);

  const fetchUpdate = useCallback(async () => {
    try {
      const updated = await fetchUserChatById(scoutUserChatId, "scout");
      setMessages(updated.messages);
    } catch (error) {
      console.log("Error fetching scoutUserChat:", error);
    }
  }, [scoutUserChatId]);

  const { replay } = useStudyContext();
  const { partialMessages: messagesDisplay } = useProgressiveMessages({
    uniqueId: `toolInvocation-${toolInvocation.toolCallId}`,
    messages: messages,
    enabled: replay,
    fixedDuration: consoleStreamWaitTime(ToolName.scoutTaskChat),
  });

  // 添加定时器效果
  useEffect(() => {
    if (replay) {
      // 如果是 replay 就只取一次
      fetchUpdate();
      return;
    }
    let timeoutId: NodeJS.Timeout;
    const poll = async () => {
      timeoutId = setTimeout(poll, 2000); // 要放在前面，不然下面 return () 的时候如果 fetchUpdate 还没完成就不会 clearTimeout 了
      await fetchUpdate();
    };
    poll();
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [fetchUpdate, replay]);

  return (
    <div className="space-y-6 w-full">
      {messagesDisplay.map((message) => {
        return (
          <StreamSteps
            key={`message-${message.id}`}
            avatar={{
              assistant: <HippyGhostAvatar seed={scoutUserChatId} />,
            }}
            role={message.role}
            content={message.content}
            parts={message.parts}
          ></StreamSteps>
        );
      })}
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
