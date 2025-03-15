"use client";
import { useRouter } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { ChatMessage } from "@/components/ChatMessage";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { useRef } from "react";
import { Button } from "@/components/ui/button";

import Link from "next/link";
export default function ScoutPage() {
  const router = useRouter();
  const {
    messages,
    setMessages,
    error,
    handleSubmit,
    input,
    setInput,
    // append,
    status,
  } = useChat({
    maxSteps: 30,
    api: "/api/chat/scout",
  });

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  function customSubmit(event: React.FormEvent<HTMLFormElement>) {
    if (error != null) {
      setMessages(messages.slice(0, -1)); // remove last message
    }

    handleSubmit(event);
  }

  const inputDisabled = status === "streaming" || status === "submitted";

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

  const StatusDisplay = ({ status }: { status: string }) => {
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
  };
  return (
    <div className="flex flex-col items-center justify-start p-10 h-dvh w-dvw max-w-7xl mx-auto">
      <div className="relative w-full">
        <div className="absolute left-0">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            ← 返回
          </Button>
        </div>
        <h1 className="text-lg font-medium mb-2 text-center">寻找目标用户</h1>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col justify-between gap-4 w-full">
        <div
          ref={messagesContainerRef}
          className="flex flex-col gap-6 h-full w-full items-center overflow-y-scroll"
        >
          <div className="bg-muted/50 rounded-lg p-4 mt-4">
            <div className="space-y-2 mr-2">
              <div className="font-medium">💡 使用建议：</div>
              <ul className="text-sm ml-4 list-disc space-y-1 text-muted-foreground">
                <li>描述越具体，AI 找到的用户越准确</li>
                <li>可以包含用户的兴趣、行为、消费习惯等特征</li>
                <li>AI 会自动搜索，帮你总结最合适的目标用户画像</li>
                <li>
                  结果会自动加入到
                  <Link
                    href="/personas"
                    className="text-blue-500 hover:underline mx-1"
                  >
                    用户画像库
                  </Link>
                  以供后续分析调研
                </li>
              </ul>
            </div>
          </div>
          {/* 目前先只保留最后5条用于避免页面越来越卡 */}
          {messages.slice(-5).map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              content={message.content}
              parts={message.parts}
            ></ChatMessage>
          ))}
          {error && (
            <div className="flex justify-center items-center text-red-500 dark:text-red-400 text-sm">
              {error.toString()}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <StatusDisplay status={status} />

        <form
          className="flex flex-col gap-2 relative items-center"
          onSubmit={customSubmit}
        >
          <textarea
            ref={inputRef}
            className={`bg-zinc-100 rounded-md px-4 py-3.5 w-full outline-none dark:bg-zinc-700 text-sm text-zinc-800 dark:text-zinc-300 md:max-w-[1200px] max-w-[calc(100dvw-32px)] ${inputDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
            placeholder="描述你想找的用户特征，例如：帮我找3位经常分享手工巧克力、有试吃经验、对美食很有研究的博主"
            rows={3}
            value={input}
            disabled={inputDisabled}
            onChange={(event) => {
              setInput(event.target.value);
            }}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing
              ) {
                e.preventDefault();
                if (input.trim()) {
                  const form = e.currentTarget.form;
                  if (form) form.requestSubmit();
                }
              }
            }}
          />
        </form>
      </div>
    </div>
  );
}
