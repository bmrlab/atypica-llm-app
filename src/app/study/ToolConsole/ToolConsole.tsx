import { StudyUserChat } from "@/data";
import { ToolName } from "@/tools";
import { useChat } from "@ai-sdk/react";
import { useEffect, useMemo } from "react";
import ToolArgs from "./ToolArgs";
import { ToolReasoningThinking } from "./ToolReasoningThinking";
import ToolScoutTaskChat from "./ToolScoutTaskChat";

export function ToolConsole({ studyChat }: { studyChat: StudyUserChat }) {
  const { messages } = useChat({
    // id 和 api 一起设置才能让 useChat 在组件之间共享状态
    id: `userChat-${studyChat.id}`,
    api: "/api/chat/study",
  });

  const lastTool = useMemo(() => {
    // 从后往前找到最后一个 tool result
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message.parts) {
        for (let j = message.parts.length - 1; j >= 0; j--) {
          const part = message.parts[j];
          if (part.type === "tool-invocation") {
            // && part.toolInvocation.state === "result") {
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
  }, [lastTool?.toolCallId]);

  if (!lastTool) return <></>;

  if (lastTool.toolName === ToolName.scoutTaskChat) {
    return <ToolScoutTaskChat chatId={lastTool.args.chatId} />;
  }

  if (lastTool.toolName === ToolName.reasoningThinking) {
    return <ToolReasoningThinking toolInvocation={lastTool} />;
  }

  <ToolArgs toolInvocation={lastTool} />;
}
