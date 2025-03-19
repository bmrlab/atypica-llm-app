"use client";
import { ChatMessage } from "@/components/ChatMessage";
import { PointAlertDialog } from "@/components/PointAlertDialog";
import { Button } from "@/components/ui/button";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { Analyst, AnalystInterview, fetchAnalystInterviewById, Persona } from "@/data";
import { Message } from "ai";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export function InterviewBackground({
  analystInterview: _analystInterview,
  analyst,
  persona,
}: {
  analystInterview: AnalystInterview;
  analyst: Analyst;
  persona: Persona;
}) {
  const [interview, setInterview] = useState<AnalystInterview>(_analystInterview);
  const [messages, setMessages] = useState<Message[]>(_analystInterview.messages);

  const fetchUpdate = useCallback(async () => {
    try {
      const updated = await fetchAnalystInterviewById(interview.id);
      setMessages(updated.messages);
      setInterview(updated);
    } catch (error) {
      console.log("Error fetching analystInterview:", error);
    }
  }, [interview.id]);

  // 添加定时器效果
  useEffect(() => {
    const intervalId: NodeJS.Timeout = setInterval(fetchUpdate, 1000);
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchUpdate]);

  const startBackgroundChat = useCallback(async () => {
    await fetch("/api/chat/interview/background", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        analyst,
        persona,
        analystInterviewId: interview.id,
      }),
    });
    await fetchUpdate();
  }, [fetchUpdate, analyst, persona, interview.id]);

  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();

  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-start py-3 sm:py-12 h-dvh w-full max-w-5xl mx-auto">
      <div className="relative w-full mb-4">
        <div className="absolute left-0 top-1/2 -translate-y-1/2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            ← 返回
          </Button>
        </div>
        <h1 className="sm:text-lg font-medium px-18 text-center truncate">
          {analyst.role}访谈{persona.name}
        </h1>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col justify-between gap-4 w-full">
        <div
          ref={messagesContainerRef}
          className="flex flex-col gap-6 h-full w-full items-center overflow-y-scroll"
        >
          {messages.map((message) => (
            <ChatMessage
              key={`message-${message.id}`}
              nickname={message.role === "assistant" ? persona.name : analyst.role}
              role={message.role}
              content={message.content}
              parts={message.parts}
            ></ChatMessage>
          ))}
          {interview.interviewToken && messages.length === 0 ? (
            <ChatMessage
              key="message-start"
              nickname="系统"
              role="system"
              content="访谈启动中 .."
            ></ChatMessage>
          ) : null}
          {!interview.interviewToken && interview.conclusion ? (
            <ChatMessage
              key="message-conclusion"
              nickname="调研结论"
              role="system"
              content={interview.conclusion}
            ></ChatMessage>
          ) : null}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex justify-center items-center">
          {!interview.interviewToken && !interview.conclusion ? (
            <PointAlertDialog points={5} onConfirm={startBackgroundChat}>
              <Button size="sm" className="px-10">
                开始访谈
              </Button>
            </PointAlertDialog>
          ) : interview.interviewToken ? (
            <div className="flex flex-col items-center gap-2">
              <div className="text-sm text-gray-500">访谈进行中</div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="text-sm text-gray-500">访谈已结束</div>
              {/* <Button size="sm" onClick={() => startBackgroundChat()}>
                重新开始
              </Button> */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
