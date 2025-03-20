import { StudyUserChat } from "@/data";
import { cn } from "@/lib/utils";
import { ToolName } from "@/tools";
import { useChat } from "@ai-sdk/react";
import { ToolInvocation } from "ai";
import { LoaderIcon } from "lucide-react";
import { useMemo } from "react";
import { useStudyContext } from "../hooks";
import AnalystReport from "./tools/AnalystReport";
import InterviewChat from "./tools/InterviewChat";
import ReasoningThinking from "./tools/ReasoningThinking";
import ScoutTaskChat from "./tools/ScoutTaskChat";

const FallbackToolDisplay = ({ toolInvocation }: { toolInvocation: ToolInvocation }) => {
  const { toolName, args } = toolInvocation;
  return (
    <pre
      className={cn(
        "text-xs whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-lg p-2 font-mono",
      )}
    >
      <div className="ml-2 mt-1 mb-2 font-bold">{toolName} exec args</div>
      <table className="text-left">
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
      <div className="ml-2 mt-4 mb-2 font-bold">result</div>
      {toolInvocation.state === "result" ? (
        <div className="text-xs whitespace-pre-wrap p-2">{toolInvocation.result.plainText}</div>
      ) : (
        <div className="p-2">
          <LoaderIcon className="animate-spin" size={16} />
        </div>
      )}
    </pre>
  );
};

export function ToolConsole({ studyChat }: { studyChat: StudyUserChat }) {
  const { messages } = useChat({
    // id 和 api 一起设置才能让 useChat 在组件之间共享状态
    id: `userChat-${studyChat.id}`,
    api: "/api/chat/study",
  });

  const { viewToolInvocation } = useStudyContext();

  const lastTool = useMemo(() => {
    // 从后往前找到最后一个 tool result
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message.parts) {
        for (let j = message.parts.length - 1; j >= 0; j--) {
          const part = message.parts[j];
          if (part.type === "tool-invocation") {
            // && part.toolInvocation.state === "result") {
            // 用 ... 复制一个出来，防止被 messages 内部修改覆盖
            return { ...part.toolInvocation };
          }
        }
      }
    }
    return null;
  }, [messages]);

  const activeTool = useMemo(() => {
    if (viewToolInvocation) {
      return viewToolInvocation;
    }
    if (lastTool) {
      return lastTool;
    }
    return null;
  }, [viewToolInvocation, lastTool]);

  switch (activeTool?.toolName) {
    case ToolName.scoutTaskChat:
      return <ScoutTaskChat toolInvocation={activeTool} />;
    case ToolName.interview:
      return <InterviewChat toolInvocation={activeTool} />;
    case ToolName.reasoningThinking:
      return <ReasoningThinking toolInvocation={activeTool} />;
    case ToolName.analystReport:
      return <AnalystReport toolInvocation={activeTool} />;
    default:
      return activeTool ? <FallbackToolDisplay toolInvocation={activeTool} /> : null;
  }
}
