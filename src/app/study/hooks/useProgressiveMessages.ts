import { ToolName } from "@/tools";
import { Message } from "ai";
import { useEffect, useMemo, useState } from "react";

export const consoleStreamWaitTime = (name?: ToolName) => {
  const vals = {
    [ToolName.interview]: 10 * 1000,
    [ToolName.scoutTaskChat]: 10 * 1000,
  } as Record<ToolName, number>;
  return name && vals[name] ? vals[name] : 1000;
};

export function useProgressiveMessages({
  messages,
  fixedDuration,
  enabled,
}: {
  messages: Message[];
  fixedDuration?: number;
  enabled: boolean;
}) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [partIndex, setPartIndex] = useState(0);

  const fixedWaitTime = useMemo(() => {
    if (fixedDuration) {
      // fixedDuration is in milliseconds
      const steps = messages.reduce((count, message) => {
        if (message.role === "user") {
          return count + 1; // 没有 part 的统一算 1 个
        } else if (message.role === "assistant") {
          return count + (message.parts?.length || 1); // 没有 part 的统一算 1 个
        }
        return count;
      }, 0);
      let waitTime = steps > 0 ? Math.floor(fixedDuration / steps) : 1000;
      waitTime = Math.floor(waitTime / 1.3); // 再减少一点，考虑两次 setTimeout 之间的延迟
      return waitTime;
    }
  }, [fixedDuration, messages]);

  const partialMessages = useMemo(() => {
    if (enabled && messageIndex < messages.length) {
      return [
        ...messages.slice(0, messageIndex),
        {
          ...messages[messageIndex],
          parts: messages[messageIndex].parts?.slice(0, partIndex + 1),
          // 如果 message.role === "user" 这边这么写依然没问题
        },
      ];
    } else {
      return [...messages];
    }
  }, [enabled, messageIndex, partIndex, messages]);

  useEffect(() => {
    setMessageIndex(0);
    setPartIndex(0);
  }, [messages]);

  // Progressive loading effect
  useEffect(() => {
    if (!enabled || !messages.length) {
      return;
    }
    if (messageIndex >= messages.length) {
      return;
    }
    const parts = messages[messageIndex].parts;
    let timer: NodeJS.Timeout | null = null;
    if (
      (!parts && partIndex >= 1) || // 没有 part 的统一算 1 个
      (parts && partIndex >= parts.length)
    ) {
      const waitTime = fixedWaitTime ?? 1000;
      timer = setTimeout(() => {
        setMessageIndex((prev) => prev + 1);
        setPartIndex(0);
      }, waitTime);
    } else {
      let waitTime = 100;
      if (fixedWaitTime) {
        waitTime = fixedWaitTime;
      } else if (parts) {
        const part = parts[partIndex];
        if (part?.type === "tool-invocation") {
          waitTime = consoleStreamWaitTime(part.toolInvocation.toolName as ToolName);
        }
      }
      timer = setTimeout(() => {
        setPartIndex((prev) => prev + 1);
      }, waitTime);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [enabled, messages, messageIndex, partIndex, fixedWaitTime]);

  return { partialMessages };
}
