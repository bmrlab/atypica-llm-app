import { Message } from "ai";
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

  return fixed;
}
