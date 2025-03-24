import { cn } from "@/lib/utils";
import { ToolName } from "@/tools";
import { ToolInvocation } from "ai";
import { LoaderIcon } from "lucide-react";
import { useMemo } from "react";
import { useStudyContext } from "../hooks/StudyContext";
import AnalystReport from "./tools/AnalystReport";
import InterviewChat from "./tools/InterviewChat";
import ReasoningThinking from "./tools/ReasoningThinking";
import ScoutTaskChat from "./tools/ScoutTaskChat";

const FallbackToolDisplay = ({ toolInvocation }: { toolInvocation: ToolInvocation }) => {
  return (
    <div className={cn("text-xs whitespace-pre-wrap p-2 font-mono")}>
      <div className="ml-1 my-2 font-bold">exec {toolInvocation.toolName}</div>
      <div className="ml-1 mt-1 mb-1 text-foreground/50">&gt;_ args</div>
      <table className="text-left">
        <tbody>
          {Object.entries(toolInvocation.args).map(([key, value]) => (
            <tr key={key}>
              <td className="p-1 align-top">{key}:</td>
              <td className="p-1 whitespace-pre-wrap">
                {typeof value === "object" ? JSON.stringify(value, null, 2) : value?.toString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="ml-1 mt-2 mb-2 text-foreground/50">&gt;_ result</div>
      {toolInvocation.state === "result" ? (
        <div className="text-xs whitespace-pre-wrap p-1">{toolInvocation.result.plainText}</div>
      ) : (
        <div className="p-1">
          <LoaderIcon className="animate-spin" size={16} />
        </div>
      )}
    </div>
  );
};

export function ToolConsole() {
  const { viewToolInvocation, lastToolInvocation } = useStudyContext();

  const activeTool = useMemo(() => {
    return viewToolInvocation || lastToolInvocation || null;
  }, [viewToolInvocation, lastToolInvocation]);

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
