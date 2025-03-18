import { reasoningThinkingTool } from "./experts/reasoning";
import { saveAnalystTool } from "./system/analyst";
import { saveInterviewConclusionTool } from "./system/saveInterviewConclusion";
import { savePersonaTool } from "./system/savePersona";
import { xhsNoteCommentsTool } from "./xhs/noteComments";
import { xhsSearchTool } from "./xhs/search";
import { xhsUserNotesTool } from "./xhs/userNotes";

const tools = {
  reasoningThinking: reasoningThinkingTool,
  xhsSearch: xhsSearchTool,
  xhsUserNotes: xhsUserNotesTool,
  xhsNoteComments: xhsNoteCommentsTool,
  savePersona: savePersonaTool,
  saveInterviewConclusion: saveInterviewConclusionTool,
  saveAnalyst: saveAnalystTool,
};

export default tools;
