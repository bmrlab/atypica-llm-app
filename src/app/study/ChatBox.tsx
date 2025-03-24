"use client";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { createUserChat, deleteMessageFromUserChat, StudyUserChat, updateUserChat } from "@/data";
import { cn, fixChatMessages } from "@/lib/utils";
import { Message, useChat } from "@ai-sdk/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { SingleMessage } from "./SingleMessage";
import { StatusDisplay } from "./StatusDisplay";

function popLastUserMessage(messages: Message[]) {
  if (messages.length > 0 && messages[messages.length - 1].role === "user") {
    // pop 会修改 messages，导致调用 popLastUserMessage 的 currentChat 产生 state 变化，会有问题
    // const lastUserMessage = messages.pop();
    return { messages: messages.slice(0, -1), lastUserMessage: messages[messages.length - 1] };
  } else {
    return { messages, lastUserMessage: null };
  }
}

export function ChatBox({ studyChat, readOnly }: { studyChat: StudyUserChat; readOnly: boolean }) {
  const [chatId, setChatId] = useState<number>(studyChat.id);

  const { messages, setMessages, error, handleSubmit, input, setInput, status, stop, reload } =
    useChat({
      // id: `userChat-${studyChat.id}`,  // 和 ToolConsole 不再使用 messages 通信，使用 context 通信
      maxSteps: 30,
      api: "/api/chat/study",
      body: {
        chatId: chatId,
      },
      // onFinish: async (message, { finishReason }) => {
      //   console.log(message, finishReason);
      // },
    });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const useChatRef = useRef({ reload, stop, setMessages });

  // 监听最新的 message
  useEffect(() => {
    if (!chatId || messages.length < 2) return; // 有了 chatId 并且 AI 回复了再保存
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(async () => {
      console.log("Saving chat...", chatId, messages);
      await updateUserChat(chatId, fixChatMessages(messages));
      timeoutRef.current = null;
    }, 5000);
  }, [chatId, messages]);

  // 监听对话切换
  useEffect(() => {
    useChatRef.current.stop();
    setChatId(studyChat.id);
    const { lastUserMessage } = popLastUserMessage(studyChat.messages);
    useChatRef.current.setMessages(studyChat.messages);
    if (lastUserMessage) {
      useChatRef.current.reload();
    }
    // if (lastUserMessage) {
    //   useChatRef.current.append({
    //     role: "user",
    //     content: lastUserMessage.content,
    //   });
    // }
    return () => {
      console.log("Cleaning up timeoutRef.current");
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [studyChat]);

  const handleSubmitMessage = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      // console.log("handleSubmitMessage", input, chatId); // 有时候第一次聊天会出现提交2条消息，这里打印debug下
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

  // const inputRef = useRef<HTMLTextAreaElement>(null);
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();
  const inputDisabled = readOnly || status === "streaming" || status === "submitted";

  return (
    <>
      <div
        ref={messagesContainerRef}
        className="flex-1 flex flex-col pb-24 w-full items-center overflow-y-scroll"
      >
        {messages.map((message, index) => (
          <SingleMessage
            key={message.id}
            role={message.role}
            content={message.content}
            parts={message.parts}
            onDelete={
              message.role === "user" && index >= messages.length - 2
                ? async () => {
                    const newMessages = await deleteMessageFromUserChat(
                      studyChat.id,
                      messages,
                      message.id,
                    );
                    setMessages(newMessages);
                  }
                : undefined
            }
          ></SingleMessage>
        ))}
        {error && (
          <div className="flex justify-center items-center text-red-500 text-sm mt-6">
            {error.toString()}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {chatId && <StatusDisplay chatId={chatId} status={status} messages={messages} />}

      <form onSubmit={handleSubmitMessage}>
        <textarea
          // ref={inputRef}
          className={cn(
            "block bg-zinc-100 rounded-md px-4 py-3.5 w-full outline-none text-sm text-zinc-800",
            inputDisabled ? "opacity-50 cursor-not-allowed" : "",
          )}
          placeholder="Ask a follow-up question or reply"
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
