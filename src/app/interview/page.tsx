"use client";
import { ChatRequestOptions } from "ai";
import {
  Message as MessageData,
  CreateMessage as CreateMessageData,
  useChat,
} from "@ai-sdk/react";
import { ChatMessage } from "@/components/Message";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { useCallback, useMemo, useRef, useState } from "react";

export default function InterviewPage() {
  const [stop, setStop] = useState(false);
  // const [newQuestion, setNewQuestion] = useState<MessageData | null>(null);

  const appendRef =
    useRef<
      (
        message: MessageData | CreateMessageData,
        chatRequestOptions?: ChatRequestOptions,
      ) => Promise<string | null | undefined> | null
    >(null);

  const interviewer = useChat({
    maxSteps: 5,
    api: "/api/chat/interviewer",
    onFinish: (message, options) => {
      console.log("interviewer", message, options);
      if (options.finishReason === "stop") {
        if (!stop) {
          appendRef.current?.({
            role: "user",
            content: message.content,
          });
        }
      }
    },
  });
  const interviewerMessage = useMemo(() => {
    const lastMessage = interviewer.messages[interviewer.messages.length - 1];
    if (lastMessage?.role === "assistant") {
      return lastMessage;
    }
  }, [interviewer.messages]);

  const { messages, error, append, status } = useChat({
    maxSteps: 5,
    api: "/api/chat/persona",
    onFinish: (message, options) => {
      if (options.finishReason === "stop") {
        // 所有 tool call 都结束，给了最后回答
        if (!stop) {
          interviewer.append({
            role: "user",
            content: message.content,
          });
        }
      }
    },
  });

  appendRef.current = append;

  const startConversation = useCallback(() => {
    setStop(false);
    append({
      role: "user",
      content: "你好，请介绍一下自己",
    });
  }, [append]);

  const stopConversation = useCallback(() => {
    setStop(true);
  }, []);

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  return (
    <div className="flex flex-row justify-center pb-20 h-dvh bg-white dark:bg-zinc-900">
      <div className="flex flex-col justify-between gap-4 w-[800px] h-full">
        <div
          ref={messagesContainerRef}
          className="flex flex-col gap-6 h-full w-full items-center overflow-y-scroll"
        >
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              nickname={message.role === "assistant" ? "用户" : "品牌"}
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

        {status && (
          <div className="flex justify-center items-center text-zinc-500 dark:text-zinc-400 text-sm">
            {status}
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex justify-center items-center">
            <button
              onClick={startConversation}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              开始会话
            </button>
          </div>
        ) : (
          <div className="flex justify-center items-center">
            <button
              onClick={stopConversation}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              结束会话
            </button>
          </div>
        )}
      </div>
      <div className="ml-10 w-[400px] h-full overflow-auto scale-75">
        {interviewerMessage && (
          <ChatMessage
            key={interviewerMessage.id}
            nickname={"品牌正在准备问题"}
            role={interviewerMessage.role}
            content={interviewerMessage.content}
            parts={interviewerMessage.parts}
          ></ChatMessage>
        )}
      </div>
    </div>
  );
}
