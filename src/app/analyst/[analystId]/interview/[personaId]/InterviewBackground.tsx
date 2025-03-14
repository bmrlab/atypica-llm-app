"use client";
import { useCallback, useEffect, useState } from "react";
import { ChatMessage } from "@/components/Message";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { Analyst, Persona } from "@/data";
import { Markdown } from "@/components/markdown";
import { AnalystInterview } from "@/data";
import { Button } from "@/components/ui/button";
import { Message } from "ai";

export function InterviewBackground({
  analystInterview,
  analyst,
  persona,
}: {
  analystInterview: AnalystInterview;
  analyst: Analyst;
  persona: Persona;
}) {
  const [messages, setMessages] = useState<Message[]>(
    analystInterview.messages,
  );

  const [stop, setStop] = useState<"initial" | "talking" | "terminated">(
    "initial",
  );

  const fetchUpdate = useCallback(async () => {
    try {
      const response = await fetch(
        `/analyst/${analyst.id}/interview/${persona.id}/api`,
      );
      const updated = await response.json();
      setMessages(updated.messages);
      // if (updated.status === "terminated") {
      //   setStop("terminated");
      // }
    } catch (error) {
      console.error("Error fetching analystInterview:", error);
    }
  }, [analyst.id, persona.id]);

  // 添加定时器效果
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (stop === "talking") {
      intervalId = setInterval(fetchUpdate, 5000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [stop, fetchUpdate]);

  const startBackgroundChat = useCallback(async () => {
    await fetch("/analyst/api/chat/background", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        analyst,
        persona,
        analystInterviewId: analystInterview.id,
      }),
    });
  }, [analyst, persona, analystInterview.id]);

  const startConversation = useCallback(() => {
    setStop("talking");
    startBackgroundChat();
  }, [startBackgroundChat]);

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  return (
    <div className="flex flex-row justify-center pb-20 h-dvh bg-white dark:bg-zinc-900">
      <div className="text-xs w-[400px] m-10 h-full overflow-y-scroll">
        <Markdown>{analystInterview.conclusion}</Markdown>
      </div>
      <div className="flex flex-col justify-between gap-4 w-[1000px] h-full">
        <div
          ref={messagesContainerRef}
          className="flex flex-col gap-6 h-full w-full items-center overflow-y-scroll"
        >
          {messages.map((message) => (
            <ChatMessage
              key={`message-${message.id}`}
              nickname={message.role === "assistant" ? "用户" : "品牌"}
              role={message.role}
              content={message.content}
              parts={message.parts}
            ></ChatMessage>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex justify-center items-center">
          {stop === "initial" ? (
            <Button onClick={startConversation}>开始会话</Button>
          ) : stop === "talking" ? (
            <div>Interview is ongoing</div>
          ) : (
            <div>会话结束</div>
          )}
        </div>
      </div>
    </div>
  );
}
