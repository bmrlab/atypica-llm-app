"use client";
import { useChat } from "@ai-sdk/react";
import { Message } from "@/components/Message";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { motion } from "framer-motion";
import { useRef } from "react";

export default function Chat() {
  const {
    messages,
    setMessages,
    error,
    handleSubmit,
    input,
    setInput,
    append,
    status,
  } = useChat({
    maxSteps: 30,
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

  const suggestedActions = [
    {
      title: "Where is",
      label: "my watch?",
      action: "where is my watch?",
    },
    {
      title: "What orders",
      label: "have shipped?",
      action: "what orders have shipped?",
    },
  ];

  return (
    <div className="flex flex-row justify-center pb-20 h-dvh bg-white dark:bg-zinc-900">
      <div className="flex flex-col justify-between gap-4">
        <div
          ref={messagesContainerRef}
          className="flex flex-col gap-6 h-full w-dvw items-center overflow-y-scroll"
        >
          {/* 目前先只保留最后5条用于避免页面越来越卡 */}
          {messages.slice(-5).map((message) => (
            <Message
              key={message.id}
              role={message.role}
              content={message.content}
              parts={message.parts}
            ></Message>
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

        <div className="grid sm:grid-cols-2 gap-2 w-full px-4 md:px-0 mx-auto md:max-w-[1200px] mb-4">
          {messages.length === 0 &&
            suggestedActions.map((suggestedAction, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                key={index}
                className={index > 1 ? "hidden sm:block" : "block"}
              >
                <button
                  onClick={async () => {
                    append({
                      role: "user",
                      content: suggestedAction.action,
                    });
                  }}
                  className="w-full text-left border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 rounded-lg p-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex flex-col"
                >
                  <span className="font-medium">{suggestedAction.title}</span>
                  <span className="text-zinc-500 dark:text-zinc-400">
                    {suggestedAction.label}
                  </span>
                </button>
              </motion.div>
            ))}
        </div>

        <form
          className="flex flex-col gap-2 relative items-center"
          onSubmit={customSubmit}
        >
          <textarea
            ref={inputRef}
            className="bg-zinc-100 rounded-md px-4 py-3.5 w-full outline-none dark:bg-zinc-700 text-sm text-zinc-800 dark:text-zinc-300 md:max-w-[1200px] max-w-[calc(100dvw-32px)]"
            placeholder="Send a message..."
            rows={3}
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
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
