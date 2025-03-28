import ToolArgsTable from "@/components/ToolArgsTable";
import { cn } from "@/lib/utils";
import { ToolName } from "@/tools";
import { ToolInvocation } from "ai";
import { LoaderIcon } from "lucide-react";
import { useMemo } from "react";
import { useStudyContext } from "./hooks/StudyContext";
import GenerateReport from "./tools/console/GenerateReport";
import InterviewChat from "./tools/console/InterviewChat";
import ReasoningThinking from "./tools/console/ReasoningThinking";
import ScoutTaskChat from "./tools/console/ScoutTaskChat";

const FallbackToolDisplay = ({ toolInvocation }: { toolInvocation: ToolInvocation }) => {
  return (
    <div className={cn("text-xs whitespace-pre-wrap p-2 font-mono")}>
      <div className="ml-1 my-2 font-bold">exec {toolInvocation.toolName}</div>
      <div className="ml-1 mt-1 mb-1 text-primary">&gt;_ args</div>
      <ToolArgsTable toolInvocation={toolInvocation} />
      <div className="ml-1 mt-2 mb-2 text-primary">&gt;_ result</div>
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
    case ToolName.interviewChat:
      return <InterviewChat toolInvocation={activeTool} />;
    case ToolName.reasoningThinking:
      return <ReasoningThinking toolInvocation={activeTool} />;
    case ToolName.generateReport:
      return <GenerateReport toolInvocation={activeTool} />;
    default:
      return activeTool ? <FallbackToolDisplay toolInvocation={activeTool} /> : null;
  }
}
