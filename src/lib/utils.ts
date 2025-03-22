import { generateId, Message, StepResult, ToolSet } from "ai";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fixChatMessages(messages: Message[]) {
  let fixed = messages.map((message) => {
    if (!message.parts) {
      return message;
    }
    const parts = message.parts.filter((part) => {
      if (part.type === "tool-invocation") {
        // 如果不是 result，一定是执行了一半挂了，丢弃
        return part.toolInvocation.state === "result";
      } else if (part.type === "text") {
        return part.text.trim();
      } else {
        return true;
      }
    });
    return { ...message, parts };
  });

  if (
    fixed.length > 1 &&
    fixed[fixed.length - 2].role === "user" &&
    fixed[fixed.length - 1].role === "user"
  ) {
    // 如果最后 2 条都是 user，一定是之前聊了一半挂了，丢掉最后一条
    fixed = fixed.slice(0, -1);
  }

  if (
    fixed.length > 1 &&
    fixed[fixed.length - 1].role === "assistant" &&
    !fixed[fixed.length - 1].parts?.length &&
    !fixed[fixed.length - 1].content.trim()
  ) {
    // Bedrock 不支持最后一条空的 assistant 消息
    fixed = fixed.slice(0, -1);
  }

  return fixed;
}

export function streamStepsToUIMessage<T extends ToolSet>(
  steps: StepResult<T>[],
): Omit<Message, "role"> {
  const parts: Message["parts"] = [];
  const contents = [];
  for (const step of steps) {
    if (step.stepType === "initial") {
      contents.push(step.text);
      parts.push({ type: "text", text: step.text });
    } else if (step.stepType === "continue") {
      contents.push(step.text);
      parts.push({ type: "text", text: step.text });
    } else if (step.stepType === "tool-result") {
      contents.push(step.text);
      for (const toolResult of step.toolResults) {
        parts.push({
          type: "tool-invocation",
          toolInvocation: {
            state: "result",
            toolName: toolResult.toolName,
            args: toolResult.args,
            result: toolResult.result,
            toolCallId: toolResult.toolCallId,
          },
        });
      }
      parts.push({ type: "text", text: step.text });
    }
  }
  return {
    id: generateId(),
    content: contents.join("\n"),
    parts,
  };
}

export function appendStreamStepToUIMessage<T extends ToolSet>(
  message: Omit<Message, "role">,
  step: StepResult<T>,
) {
  const parts: Message["parts"] = message.parts ?? [];
  const contents = [message.content ?? ""];
  if (step.stepType === "initial") {
    contents.push(step.text);
    parts.push({ type: "text", text: step.text });
  } else if (step.stepType === "continue") {
    contents.push(step.text);
    parts.push({ type: "text", text: step.text });
  } else if (step.stepType === "tool-result") {
    contents.push(step.text);
    for (const toolResult of step.toolResults) {
      parts.push({
        type: "tool-invocation",
        toolInvocation: {
          state: "result",
          toolName: toolResult.toolName,
          args: toolResult.args,
          result: toolResult.result,
          toolCallId: toolResult.toolCallId,
        },
      });
    }
    parts.push({ type: "text", text: step.text });
  }
  message.content = contents.join("\n");
  message.parts = parts;
}

export const generateToken = (length = 16) =>
  Array(length)
    .fill(0)
    .map(
      () => "abcdefghijkmnpqrstuvwxyzACDEFGHJKLMNPQRTUVWXY346792"[Math.floor(Math.random() * 51)],
    )
    .join("");
