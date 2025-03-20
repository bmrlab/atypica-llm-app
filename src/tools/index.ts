import { interviewTool } from "./experts/interview";
import { reasoningThinkingTool } from "./experts/reasoning";
import { analystReportTool } from "./experts/report";
import { scoutTaskChatTool, scoutTaskCreateTool } from "./experts/scouting";
import { saveAnalystTool } from "./system/saveAnalyst";
import { saveInterviewConclusionTool } from "./system/saveInterviewConclusion";
import { savePersonaTool } from "./system/savePersona";
import { xhsNoteCommentsTool } from "./xhs/noteComments";
import { xhsSearchTool } from "./xhs/search";
import { xhsUserNotesTool } from "./xhs/userNotes";

const tools = {
  reasoningThinking: reasoningThinkingTool,
  scoutTaskChat: scoutTaskChatTool,
  scoutTaskCreate: scoutTaskCreateTool,
  interview: interviewTool,
  analystReport: analystReportTool,

  xhsSearch: xhsSearchTool,
  xhsUserNotes: xhsUserNotesTool,
  xhsNoteComments: xhsNoteCommentsTool,

  savePersona: savePersonaTool,
  saveInterviewConclusion: saveInterviewConclusionTool,
  saveAnalyst: saveAnalystTool,
};

export enum ToolName {
  reasoningThinking = "reasoningThinking",
  scoutTaskChat = "scoutTaskChat",
  scoutTaskCreate = "scoutTaskCreate",
  interview = "interview",
  analystReport = "analystReport",
  xhsSearch = "xhsSearch",
  xhsUserNotes = "xhsUserNotes",
  xhsNoteComments = "xhsNoteComments",
  savePersona = "savePersona",
  saveInterviewConclusion = "saveInterviewConclusion",
  saveAnalyst = "saveAnalyst",
}

export default tools;
