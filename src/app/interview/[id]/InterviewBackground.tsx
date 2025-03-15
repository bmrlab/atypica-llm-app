"use client";
import { useCallback, useEffect, useState } from "react";
import { ChatMessage } from "@/components/ChatMessage";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { Analyst, fetchAnalystInterviewById, Persona } from "@/data";
import { AnalystInterview } from "@/data";
import { Button } from "@/components/ui/button";
import { PointAlertDialog } from "@/components/PointAlertDialog";
import { useRouter } from "next/navigation";
import { Message } from "ai";

export function InterviewBackground({
  analystInterview: _analystInterview,
  analyst,
  persona,
}: {
  analystInterview: AnalystInterview;
  analyst: Analyst;
  persona: Persona;
}) {
  const [interview, setInterview] =
    useState<AnalystInterview>(_analystInterview);
  const [messages, setMessages] = useState<Message[]>(
    _analystInterview.messages,
  );

  const fetchUpdate = useCallback(async () => {
    try {
      const updated = await fetchAnalystInterviewById(interview.id);
      if (updated) {
        setMessages(updated.messages);
        setInterview(updated);
      }
    } catch (error) {
      console.error("Error fetching analystInterview:", error);
    }
  }, [interview.id]);

  // 添加定时器效果
  useEffect(() => {
    const intervalId: NodeJS.Timeout = setInterval(fetchUpdate, 5000);
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

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-start p-10 h-dvh w-dvw max-w-7xl mx-auto">
      <div className="relative w-full">
        <div className="absolute left-0">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            ← 返回
          </Button>
        </div>
        <h1 className="text-lg font-medium mb-4 text-center">
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
              nickname={
                message.role === "assistant" ? persona.name : analyst.role
              }
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
