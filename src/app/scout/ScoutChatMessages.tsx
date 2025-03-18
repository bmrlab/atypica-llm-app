"use client";
import { ChatMessage } from "@/components/ChatMessage";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { createUserChat, updateUserChat, UserChat } from "@/data";
import { fixChatMessages } from "@/lib/utils";
import { useChat } from "@ai-sdk/react";
import { Message } from "ai";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { StatusDisplay } from "./StatusDisplay";

const validateChatMessages = (messages: Message[]) => {
  if (messages.length > 0 && messages[messages.length - 1]?.role === "user") {
    messages.pop();
  }
  return messages;
};

export function ScoutChatMessages({ currentChat }: { currentChat: UserChat | null }) {
  const [chatId, setChatId] = useState<number | null>(currentChat?.id ?? null);

  // https://github.com/vercel/ai/blob/50555848a54e6bace3e22d175db58c04f04ea5a4/packages/react/src/use-chat.ts#L230
  // useChat 会监听 credentials,headers,body, 的变化，但是其他的不监听
  // onResponse 和 onFinish 也被 hook 保存状态了，所以他俩都监听不到 chatId 的变化，只能在下面 useEffect 里主动监听 messages

  const { messages, setMessages, error, handleSubmit, input, setInput, status, stop } = useChat({
    maxSteps: 30,
    api: "/api/chat/scout",
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
      event.preventDefault();
      if (!input) return;
      if (!chatId) {
        const userChat = await createUserChat("scout", {
          role: "user",
          content: input,
        });
        setChatId(userChat.id);
        // 这里设置了，在调用 handleSubmit 的时候还没有更新 useChat 的 body，所以 setChatId 以后，还要在 handleSubmit 里直接提交
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
        <div className="bg-muted/50 rounded-lg p-4 mt-4">
          <div className="space-y-2 mr-2">
            <div className="font-medium">💡 使用建议：</div>
            <ul className="text-sm ml-4 list-disc space-y-1 text-muted-foreground">
              <li>描述越具体，AI 找到的用户越准确</li>
              <li>可以包含用户的兴趣、行为、消费习惯等特征</li>
              <li>AI 会自动搜索，帮你总结最合适的目标用户画像</li>
              <li>
                结果会自动加入到
                <Link href="/personas" className="text-blue-500 hover:underline mx-1">
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

      {chatId && <StatusDisplay chatId={chatId} status={status} messages={messages} />}

      <form onSubmit={handleSubmitMessage}>
        <textarea
          // ref={inputRef}
          className={`bg-zinc-100 rounded-md px-4 py-3.5 w-full outline-none text-sm text-zinc-800 ${inputDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
          placeholder="描述你想找的用户特征，例如：帮我找3位经常分享手工巧克力、有试吃经验、对美食很有研究的博主"
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
