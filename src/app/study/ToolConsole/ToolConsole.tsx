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
