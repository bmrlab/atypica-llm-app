"use client";
import { useRouter } from "next/navigation";
import { Message, useChat } from "@ai-sdk/react";
import { ChatMessage } from "@/components/ChatMessage";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { fetchUserScoutChats, saveUserScoutChat, UserScoutChat } from "@/data";

const validateChatMessages = (currentChat: UserScoutChat | null) => {
  const messages = currentChat?.messages ?? [];
  if (messages[messages.length - 1]?.role === "user") {
    messages.pop();
  }
  return messages;
};

export function ScoutChatSingle({
  currentChat,
}: {
  currentChat: UserScoutChat | null;
}) {
  const router = useRouter();
  const [chatId, setChatId] = useState<number | null>(currentChat?.id ?? null);

  const {
    messages,
    setMessages,
    error,
    handleSubmit,
    input,
    setInput,
    status,
    stop,
  } = useChat({
    initialMessages: validateChatMessages(currentChat),
    maxSteps: 30,
    api: "/api/chat/scout",
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // useChat 的 onResponse 和 onFinish 都监听不到 chatId 的变化，只能这里主动监听 messages
    if (messages.length < 2) return; // AI 回复了再保存
    if (timeoutRef.current) return; // throttled
    timeoutRef.current = setTimeout(async () => {
      console.log("Saving chat...", chatId, messages);
      const chat = await saveUserScoutChat(chatId, messages);
      setChatId(chat.id);
      timeoutRef.current = null;
    }, 5000);
  }, [chatId, messages]);

  useEffect(() => {
    // 监听 currentChat?.id 切换对话
    // 同时 clearTimeout，这个要写在这里，不能写在上一个 useEffect 里，否则 messages 更新就会导致 clearTimeout
    stop();
    setMessages(validateChatMessages(currentChat));
    setChatId(currentChat?.id ?? null);
    return () => {
      console.log("Cleaning up timeoutRef.current");
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentChat?.id]);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  function handleSubmitMessage(event: React.FormEvent<HTMLFormElement>) {
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
    <div className="flex flex-col items-center justify-start py-3 sm:py-12 h-dvh w-full max-w-5xl mx-auto">
      <div className="relative w-full mb-4 sm:mb-8">
        <div className="absolute left-0 top-1/2 -translate-y-1/2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            ← 返回
          </Button>
        </div>
        <h1 className="sm:text-lg font-medium px-18 text-center truncate">
          {currentChat?.title || "寻找目标用户"}
        </h1>
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
          onSubmit={handleSubmitMessage}
        >
          <textarea
            ref={inputRef}
            className={`bg-zinc-100 rounded-md px-4 py-3.5 w-full outline-none text-sm text-zinc-800 ${inputDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
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

export function ScoutChat() {
  const [currentChat, setCurrentChat] = useState<UserScoutChat | null>(null);
  const [chats, setChats] = useState<UserScoutChat[]>([]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const chats = await fetchUserScoutChats();
        setChats(chats);
      } catch (error) {
        console.error("Failed to fetch active chats:", error);
      }
    };
    fetchChats();
    const interval = setInterval(() => {
      fetchChats();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative xl:px-[200px]">
      <ScoutChatSingle currentChat={currentChat} />
      <div className="hidden xl:block absolute right-0 top-0 w-[180px] pt-20 max-h-dvh">
        <div className="text-sm font-medium text-zinc-500 mb-3 text-center">
          历史对话
        </div>
        <div className="space-y-2">
          <div
            className="px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-100 rounded cursor-pointer"
            onClick={() => setCurrentChat(null)}
          >
            新对话
          </div>
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setCurrentChat(chat)}
              className="px-3 py-2 text-sm truncate text-zinc-500 hover:bg-zinc-100 rounded cursor-pointer"
            >
              {chat.title || "未命名对话"}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
