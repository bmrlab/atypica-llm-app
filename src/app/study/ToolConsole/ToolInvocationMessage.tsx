"use client";
import { ToolName } from "@/tools";
import {
  ReasoningThinkingResultMessage,
  SaveAnalystToolResultMessage,
  XHSNoteCommentsResultMessage,
  XHSSearchResultMessage,
  XHSUserNotesResultMessage,
} from "@/tools/ui/ToolMessage";
import { ToolInvocation } from "ai";
import ToolArgs from "./ToolArgs";

const ToolInvocationMessage = ({ toolInvocation }: { toolInvocation: ToolInvocation }) => {
  if (toolInvocation.state === "call" || toolInvocation.state === "partial-call") {
    const { toolName, args } = toolInvocation;
    return (
      <div>
        {/* 正在执行  */}
        <ToolArgs toolName={toolName} args={args} />
      </div>
    );
  } else if (toolInvocation.state === "result") {
    const { toolName, args, result } = toolInvocation;
    const renderResult = () => {
      switch (toolName) {
        case ToolName.xhsSearch:
          return <XHSSearchResultMessage result={result} />;
        case ToolName.xhsUserNotes:
          return <XHSUserNotesResultMessage result={result} />;
        case ToolName.xhsNoteComments:
          return <XHSNoteCommentsResultMessage result={result} />;
        case ToolName.reasoningThinking:
          return <ReasoningThinkingResultMessage result={result} />;
        case ToolName.saveAnalyst:
          return <SaveAnalystToolResultMessage result={result} />;
        default:
          return (
            <pre className="text-xs whitespace-pre-wrap p-4 text-muted-foreground bg-gray-50 border border-gray-100 rounded-lg">
              {toolName} {JSON.stringify(result)}
            </pre>
          );
      }
    };
    return (
      <div>
        <ToolArgs toolName={toolName} args={args} />
        <div className="text-sm text-zinc-800 my-4"> result</div>
        {renderResult()}
      </div>
    );
  } else {
    return null;
  }
};

export default ToolInvocationMessage;
