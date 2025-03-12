"use client";
import { useCallback, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { ChatMessage } from "@/components/Message";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { Persona } from "@/app/personas/data";

export function Interview({ persona }: { persona: Persona }) {
  const [stop, setStop] = useState(false);

  const personaAgentRef = useRef<ReturnType<typeof useChat>>(null);

  const interviewer = useChat({
    maxSteps: 5,
    api: "/interview/api/chat/interviewer",
    onFinish: (message, options) => {
      console.log("interviewer", message, options);
      if (options.finishReason === "stop") {
        if (
          !stop &&
          !message.content.includes("本次访谈结束，谢谢您的参与！")
        ) {
          personaAgentRef.current?.append({
            role: "user",
            content: message.content,
          });
        }
      }
    },
  });

  const personaAgent = useChat({
    maxSteps: 5,
    api: "/interview/api/chat/persona",
    body: {
      persona: persona?.prompt,
    },
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

  personaAgentRef.current = personaAgent;

  const startConversation = useCallback(() => {
    if (!persona) {
      return;
    }
    setStop(false);
    personaAgent.append({
      role: "user",
      content: "你好，请介绍一下自己",
    });
  }, [personaAgent, persona]);

  const stopConversation = useCallback(() => {
    setStop(true);
  }, []);

  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  return (
    <div className="flex flex-row justify-center pb-20 h-dvh bg-white dark:bg-zinc-900">
      <div className="flex flex-col justify-between gap-4 w-[1200px] h-full">
        <div
          ref={messagesContainerRef}
          className="flex flex-col gap-6 h-full w-full items-center overflow-y-scroll"
        >
          {personaAgent.messages.map((message) => (
            <ChatMessage
              key={`message-${message.id}`}
              nickname={message.role === "assistant" ? "用户" : "品牌"}
              role={message.role}
              content={message.content}
              parts={message.parts}
            ></ChatMessage>
          ))}
          {personaAgent.status === "ready" &&
            (interviewer.status === "streaming" ||
              interviewer.status === "ready") &&
            interviewer.messages
              .filter((m) => m.role === "assistant")
              .slice(-1)
              .map((interviewerMessage) => (
                <ChatMessage
                  key={`pending-${interviewerMessage.id}`}
                  nickname={"品牌正在准备问题"}
                  role={interviewerMessage.role}
                  content={interviewerMessage.content}
                  parts={interviewerMessage.parts}
                ></ChatMessage>
              ))}
          {personaAgent.error && (
            <div className="flex justify-center items-center text-red-500 dark:text-red-400 text-sm">
              {personaAgent.error.toString()}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {personaAgent.status && (
          <div className="flex justify-center items-center text-zinc-500 dark:text-zinc-400 text-sm">
            {personaAgent.status}
          </div>
        )}

        {personaAgent.messages.length === 0 ? (
          <div className="flex justify-center items-center">
            <button
              onClick={startConversation}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              开始会话
            </button>
          </div>
        ) : !stop ? (
          <div className="flex justify-center items-center">
            <button
              onClick={stopConversation}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              结束会话
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
