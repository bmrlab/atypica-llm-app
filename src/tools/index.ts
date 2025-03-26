import { requestInteractionTool } from "./experts/interaction";
import { interviewTool } from "./experts/interview";
import { reasoningThinkingTool } from "./experts/reasoning";
import { analystReportTool } from "./experts/report";
import { scoutTaskChatTool, scoutTaskCreateTool } from "./experts/scouting";
import { saveAnalystStudySummaryTool, saveAnalystTool } from "./system/saveAnalyst";
import { saveInterviewConclusionTool } from "./system/saveInterviewConclusion";
import { savePersonaTool } from "./system/savePersona";
import { xhsNoteCommentsTool } from "./xhs/noteComments";
import { xhsSearchTool } from "./xhs/search";
import { xhsUserNotesTool } from "./xhs/userNotes";

export enum ToolName {
  analystReport = "analystReport",
  interview = "interview",
  reasoningThinking = "reasoningThinking",
  requestInteraction = "requestInteraction",
  saveAnalyst = "saveAnalyst",
  saveAnalystStudySummary = "saveAnalystStudySummary",
  saveInterviewConclusion = "saveInterviewConclusion",
  savePersona = "savePersona",
  scoutTaskChat = "scoutTaskChat",
  scoutTaskCreate = "scoutTaskCreate",
  xhsNoteComments = "xhsNoteComments",
  xhsSearch = "xhsSearch",
  xhsUserNotes = "xhsUserNotes",
}

export {
  analystReportTool,
  interviewTool,
  reasoningThinkingTool,
  requestInteractionTool,
  saveAnalystStudySummaryTool,
  saveAnalystTool,
  saveInterviewConclusionTool,
  savePersonaTool,
  scoutTaskChatTool,
  scoutTaskCreateTool,
  xhsNoteCommentsTool,
  xhsSearchTool,
  xhsUserNotesTool,
};

export type StatReporter = (
  dimension: "tokens" | "duration" | "steps" | "personas",
  value: number,
  extra?: unknown,
) => Promise<void>;
