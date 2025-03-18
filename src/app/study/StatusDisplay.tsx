"use client";
import { Message } from "ai";

export function StatusDisplay({ status }: { chatId: number; status: string; messages: Message[] }) {
  const getStatusMessage = (status: string) => {
    switch (status) {
      case "streaming":
        return "AI 正在思考中...";
      case "submitted":
        return "正在处理您的请求...";
      case "complete":
        return "处理完成 ✨";
      case "error":
        return "出现错误，请重试";
      case "ready":
        return "";
      default:
        return "";
    }
  };

  if (!status) return null;

  return (
    <div className="flex gap-2 justify-center items-center text-zinc-500 dark:text-zinc-400 text-sm">
      {status === "streaming" && (
        <div className="flex gap-1">
          <span className="animate-bounce">·</span>
          <span className="animate-bounce [animation-delay:0.2s]">·</span>
          <span className="animate-bounce [animation-delay:0.4s]">·</span>
        </div>
      )}
      <span>{getStatusMessage(status)}</span>
    </div>
  );
}
