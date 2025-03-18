"use client";
import { ChatMessage } from "@/components/ChatMessage";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { createUserChat, updateUserChat, UserChat } from "@/data";
import { fixChatMessages } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { Message } from "ai";
import { useCallback, useEffect, useRef, useState } from "react";
import { StatusDisplay } from "./StatusDisplay";

const validateChatMessages = (messages: Message[]) => {
  if (messages.length > 0 && messages[messages.length - 1]?.role === "user") {
    messages.pop();
  }
  return messages;
};

export function StudyChatMessages({ currentChat }: { currentChat: UserChat | null }) {
  const [chatId, setChatId] = useState<number | null>(currentChat?.id ?? null);

  const { messages, setMessages, error, handleSubmit, input, setInput, status, stop } = useChat({
    maxSteps: 30,
    api: "/api/chat/study",
    initialMessages: validateChatMessages(currentChat?.messages ?? []),
    body: {
      chatId: chatId,
    },
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!chatId || messages.length < 2) return; // 有了 chatId 并且 AI 回复了再保存
    if (timeoutRef.current) return; // throttled
    timeoutRef.current = setTimeout(() => (timeoutRef.current = null), 5000);
    // 先保存然后等待 5 分钟
    (async () => {
      console.log("Saving chat...", chatId, messages);
      // 保存之前先 fix 一下，清除异常的数据
      await updateUserChat(chatId, fixChatMessages(messages));
    })();
  }, [chatId, messages]);

  useEffect(() => {
    // 监听 currentChat?.id 切换对话
    // 同时 clearTimeout，这个要写在这里，不能写在上一个 useEffect 里，否则 messages 更新就会导致 clearTimeout
    stop();
    setMessages(validateChatMessages(currentChat?.messages ?? []));
    setChatId(currentChat?.id ?? null);
    return () => {
      console.log("Cleaning up timeoutRef.current");
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentChat?.id, currentChat?.messages, setMessages, stop]);

  // const inputRef = useRef<HTMLTextAreaElement>(null);
  const handleSubmitMessage = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      console.log("handleSubmitMessage", input, chatId); // 有时候第一次聊天会出现提交2条消息，这里打印debug下
      event.preventDefault();
      if (!input) return;
      if (!chatId) {
        const userChat = await createUserChat("study", {
          role: "user",
          content: input,
        });
        setChatId(userChat.id);
        handleSubmit(event, {
          body: { chatId: userChat.id },
        });
      } else {
        handleSubmit(event, {
          body: { chatId },
        });
      }
    },
    [handleSubmit, chatId, input],
  );

  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();

  const inputDisabled = status === "streaming" || status === "submitted";

  return (
    <>
      <div
        ref={messagesContainerRef}
        className="flex-1 flex flex-col gap-6 w-full items-center overflow-y-scroll"
      >
        {messages.map((message) => (
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

      {chatId && <StatusDisplay chatId={chatId} status={status} messages={messages} />}

      <form onSubmit={handleSubmitMessage}>
        <textarea
          // ref={inputRef}
          className={`bg-zinc-100 rounded-md px-4 py-3.5 w-full outline-none text-sm text-zinc-800 ${inputDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
          placeholder="研究一切事物"
          rows={3}
          value={input}
          disabled={inputDisabled}
          onChange={(event) => {
            setInput(event.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              if (input.trim()) {
                const form = e.currentTarget.form;
                if (form) form.requestSubmit();
              }
            }
          }}
        />
      </form>
    </>
  );
}
