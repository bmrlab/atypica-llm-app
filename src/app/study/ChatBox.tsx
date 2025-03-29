"use client";
import HippyGhostAvatar from "@/components/HippyGhostAvatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { deleteMessageFromUserChat, StudyUserChat, updateUserChat } from "@/data";
import { cn, fixChatMessages } from "@/lib/utils";
import { Message, useChat } from "@ai-sdk/react";
import { ArrowRightIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { NerdStats } from "./NerdStats";
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

export function ChatBox({
  studyUserChat,
  readOnly,
}: {
  studyUserChat: StudyUserChat;
  readOnly: boolean;
}) {
  const [studyUserChatId, setStudyUserChatId] = useState<number>(studyUserChat.id);

  const {
    messages,
    setMessages,
    error,
    handleSubmit,
    input,
    setInput,
    status,
    stop,
    reload,
    append,
    addToolResult,
  } = useChat({
    // id: `studyUserChat-${studyUserChat.id}`,  // 和 ToolConsole 不再使用 messages 通信，使用 context 通信
    maxSteps: 30,
    api: "/api/chat/study",
    body: {
      studyUserChatId,
    },
    // onFinish: async (message, { finishReason }) => {
    //   console.log(message, finishReason);
    // },
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const useChatRef = useRef({ reload, append, stop, setMessages });

  // 监听最新的 messages 并保存，使用 rebounce, 5s 没任何更新则保存
  useEffect(() => {
    if (messages.length < 2) return; // 有了 studyUserChatId 并且 AI 回复了再保存
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(async () => {
      // console.log("Saving chat...", studyUserChatId, messages);
      // 保存之前先 fix 一下，清除异常的数据
      await updateUserChat(studyUserChatId, fixChatMessages(messages));
      timeoutRef.current = null;
    }, 5000);
  }, [studyUserChatId, messages]);

  // 监听对话切换
  useEffect(() => {
    useChatRef.current.stop();
    setStudyUserChatId(studyUserChat.id);
    const { lastUserMessage } = popLastUserMessage(studyUserChat.messages);
    useChatRef.current.setMessages(studyUserChat.messages);
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
  }, [studyUserChat]);

  const handleSubmitMessage = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      // console.log("handleSubmitMessage", input, studyUserChatId); // 有时候第一次聊天会出现提交2条消息，这里打印debug下
      event.preventDefault();
      handleSubmit(event, {
        body: { studyUserChatId },
      });
    },
    [handleSubmit, studyUserChatId, input],
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
            message={message}
            addToolResult={addToolResult}
            avatar={{ assistant: <HippyGhostAvatar seed={studyUserChat.id} /> }}
            onDelete={
              message.role === "user" && index >= messages.length - 2
                ? async () => {
                    const newMessages = await deleteMessageFromUserChat(
                      studyUserChat.id,
                      messages,
                      message.id,
                    );
                    setMessages(newMessages);
                  }
                : undefined
            }
            isLastMessage={index === messages.length - 1}
          ></SingleMessage>
        ))}
        {error && (
          <div className="flex justify-center items-center text-red-500 text-sm mt-6">
            {error.toString()}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {studyUserChatId && (
        <div className="relative">
          <StatusDisplay studyUserChatId={studyUserChatId} status={status} messages={messages} />
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <NerdStats studyUserChatId={studyUserChatId} />
          </div>
        </div>
      )}

      <form onSubmit={handleSubmitMessage} className="relative">
        <Textarea
          // ref={inputRef}
          className={cn(
            "block min-h-24 resize-none focus-visible:border-primary/70 transition-colors rounded-lg py-3 px-4",
            inputDisabled ? "opacity-50 cursor-not-allowed" : "",
          )}
          enterKeyHint="enter"
          placeholder="Ask a follow-up question or reply"
          value={input}
          disabled={inputDisabled}
          onChange={(event) => {
            setInput(event.target.value);
          }}
          onKeyDown={(e) => {
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (!isMobile && e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              if (input.trim()) {
                const form = e.currentTarget.form;
                if (form) form.requestSubmit();
              }
            }
          }}
        />
        <Button
          type="submit"
          variant="secondary"
          disabled={!input.trim()}
          className="rounded-full size-9 absolute right-4 bottom-4"
        >
          <ArrowRightIcon className="h-4 w-4 text-primary" />
        </Button>
      </form>
    </>
  );
}
