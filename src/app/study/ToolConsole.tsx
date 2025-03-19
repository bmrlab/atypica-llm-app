import { ScoutChatMessages } from "@/app/scout/ScoutChatMessages";
import { createUserChat, ScoutUserChat, StudyUserChat } from "@/data";
import { cn } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { ToolInvocation } from "ai";
import { FC, HTMLAttributes, useEffect, useMemo, useState } from "react";

function SimulateScoutChat() {
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
      className={cn("h-full overflow-hidden", "flex flex-col items-stretch justify-start gap-4")}
    >
      {scoutChat && <ScoutChatMessages scoutChat={scoutChat} environment="console" />}
    </div>
  );
}

const ToolArgs: FC<
  HTMLAttributes<HTMLPreElement> & {
    toolName: string;
    args: ToolInvocation["args"];
  }
> = ({ toolName, args, className }) => {
  return (
    <pre
      className={`text-xs whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-lg p-2 ${className}`}
    >
      <div className="ml-2 mt-1 font-bold">{toolName} 执行参数</div>
      <table className="text-left mt-2">
        <tbody>
          {Object.entries(args).map(([key, value]) => (
            <tr key={key}>
              <td className="p-2 align-top">{key}:</td>
              <td className="p-2 whitespace-pre-wrap">
                {typeof value === "object" ? JSON.stringify(value, null, 2) : value?.toString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </pre>
  );
};

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
  if (lastTool.toolName === "simulateScoutChat") return <SimulateScoutChat />;

  if (lastTool.state === "call" || lastTool.state === "partial-call") {
    return <ToolArgs toolName={lastTool.toolName} args={lastTool.args} />;
  }

  return <div>{lastTool.toolCallId}</div>;
}
