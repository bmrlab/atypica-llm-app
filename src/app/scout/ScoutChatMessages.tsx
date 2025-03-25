"use client";
import { ChatMessage } from "@/components/ChatMessage";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { createUserChat, ScoutUserChat, updateUserChat } from "@/data";
import { fixChatMessages } from "@/lib/utils";
import { Message, useChat } from "@ai-sdk/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { StatusDisplay } from "./StatusDisplay";

function popLastUserMessage(messages: Message[]) {
  if (messages.length > 0 && messages[messages.length - 1].role === "user") {
    // pop 会修改 messages，导致调用 popLastUserMessage 的 scoutChat 产生 state 变化，会有问题
    // const lastUserMessage = messages.pop();
    return { messages: messages.slice(0, -1), lastUserMessage: messages[messages.length - 1] };
  } else {
    return { messages, lastUserMessage: null };
  }
}

export function ScoutChatMessages({
  scoutChat,
  environment = "chat",
}: {
  scoutChat: ScoutUserChat | null;
  environment?: "console" | "chat";
}) {
  const t = useTranslations("ScoutPage");
  const [chatId, setChatId] = useState<number | null>(scoutChat?.id ?? null);

  // https://github.com/vercel/ai/blob/50555848a54e6bace3e22d175db58c04f04ea5a4/packages/react/src/use-chat.ts#L230
  // useChat 会监听 credentials,headers,body, 的变化，但是其他的不监听
  // onResponse 和 onFinish 也被 hook 保存状态了，所以他俩都监听不到 chatId 的变化，只能在下面 useEffect 里主动监听 messages

  const {
    messages,
    setMessages,
    error,
    handleSubmit,
    input,
    setInput,
    status,
    stop,
    // append,
    reload,
  } = useChat({
    maxSteps: 30,
    api: "/api/chat/scout",
    body: {
      chatId: chatId,
      autoChat: environment === "console",
    },
  });

  // const inputRef = useRef<HTMLTextAreaElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const useChatRef = useRef({ reload, stop, setMessages });

  // 监听最新的 message
  useEffect(() => {
    if (!chatId || messages.length < 2) return; // 有了 chatId 并且 AI 回复了再保存
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    // this is debouncing, 5s 以后保存在这个过程中，如果新的出现，就保存新的，旧的被 clear
    timeoutRef.current = setTimeout(async () => {
      // console.log("Saving chat...", chatId, messages);
      // 保存之前先 fix 一下，清除异常的数据
      await updateUserChat(chatId, fixChatMessages(messages));
      timeoutRef.current = null;
    }, 5000);
  }, [chatId, messages]);

  // 监听对话切换
  useEffect(() => {
    useChatRef.current.stop();
    if (scoutChat) {
      setChatId(scoutChat.id);
      const { lastUserMessage } = popLastUserMessage(scoutChat.messages);
      useChatRef.current.setMessages(scoutChat.messages);
      if (lastUserMessage) {
        useChatRef.current.reload();
      }
      // 如果最后一条消息是用户发的，立即开始 assistant 回复，因为不需要等用户再次输入
      // 这里现在有个问题，首次加载组件 useEffect 可能被触发两次，这样就莫名其妙 append 了两个 user message，
      // if (lastUserMessage) {
      //   useChatRef.current.append({
      //     role: "user",
      //     content: lastUserMessage.content,
      //   });
      // }
    } else {
      setMessages([]);
      setChatId(null);
    }
    return () => {
      // 上一个定时保存 messages 的 clearTimeout 要写在这里，不能写在上一个 useEffect 里，否则 messages 更新就会导致 clearTimeout
      console.log("Cleaning up timeoutRef.current");
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // 只能监听 scoutChat, 其他的不要监听，不然就死循环了！
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scoutChat]);

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
    <div className="flex-1 overflow-hidden flex flex-col items-stretch justify-between gap-4">
      <div
        ref={messagesContainerRef}
        className="flex-1 flex flex-col gap-6 w-full items-center overflow-y-scroll"
      >
        {!messages.length && (
          <div className="bg-muted/50 rounded-lg p-4 mt-4">
            <div className="space-y-2 mr-2">
              <div className="font-medium">💡 {t("hints.title")}</div>
              <ul className="text-sm ml-4 list-disc space-y-1 text-muted-foreground">
                <li>{t("hints.tip1")}</li>
                <li>{t("hints.tip2")}</li>
                <li>{t("hints.tip3")}</li>
                <li>
                  {t("hints.tip4")}
                  <Link href="/personas" className="text-blue-500 hover:underline mx-1">
                    {t("hints.tip4Link")}
                  </Link>
                  {t("hints.tip4End")}
                </li>
              </ul>
            </div>
          </div>
        )}
        {(environment === "console" ? messages.slice(-1) : messages).map((message) => (
          // 如果是控制台环境，只显示最后一条
          <ChatMessage
            key={message.id}
            role={message.role}
            content={message.content}
            parts={message.parts}
            environment={environment}
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

      {environment === "chat" && (
        <form onSubmit={handleSubmitMessage}>
          <textarea
            // ref={inputRef}
            className={`bg-zinc-100 rounded-md px-4 py-3.5 w-full outline-none text-sm text-zinc-800 ${inputDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
            placeholder={t("inputPlaceholder")}
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
      )}
    </div>
  );
}
