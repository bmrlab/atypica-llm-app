import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { Analyst, fetchInterviewByAnalystAndPersona, Persona } from "@/data";
import { fixChatMessages } from "@/lib/utils";
import { Message, ToolInvocation } from "ai";
import { useCallback, useEffect, useState } from "react";
import { StreamSteps } from "./StreamSteps";

const InterviewChat = ({ toolInvocation }: { toolInvocation: ToolInvocation }) => {
  const analystId = toolInvocation.args.analystId as number;
  const personaId = toolInvocation.args.personaId as number;

  const [interviewToken, setInterviewToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conclusion, setConclusion] = useState<string | null>(null);
  const [persona, setPersona] = useState<Persona>();
  const [analyst, setAnalyst] = useState<Analyst>();

  const fetchUpdate = useCallback(async () => {
    try {
      const interview = await fetchInterviewByAnalystAndPersona({ analystId, personaId });
      // 可能有异常的保存数据，取下来修复一下
      setMessages(fixChatMessages(interview.messages));
      setPersona(interview.persona);
      setAnalyst(interview.analyst);
      setInterviewToken(interview.interviewToken);
      setConclusion(interview.conclusion);
    } catch (error) {
      console.log("Error fetching userChat:", error);
    }
  }, [analystId, personaId]);

  // 添加定时器效果
  useEffect(() => {
    const intervalId: NodeJS.Timeout = setInterval(fetchUpdate, 5000);
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchUpdate]);

  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();

  return (
    <div className="flex flex-col gap-2 items-stretch justify-start w-full h-full overflow-hidden">
      <div ref={messagesContainerRef} className="flex-1 space-y-6 w-full overflow-y-scroll">
        {messages.map((message) => (
          <StreamSteps
            key={`message-${message.id}`}
            nickname={message.role === "assistant" ? persona?.name : analyst?.role}
            role={message.role}
            content={message.content}
            parts={message.parts}
          ></StreamSteps>
        ))}
        {interviewToken && messages.length === 0 ? (
          <StreamSteps
            key="message-start"
            nickname="系统"
            role="system"
            content="访谈启动中 .."
          ></StreamSteps>
        ) : null}
        {!interviewToken && conclusion ? (
          <StreamSteps
            key="message-conclusion"
            nickname="调研结论"
            role="system"
            content={conclusion}
          ></StreamSteps>
        ) : null}
        <div ref={messagesEndRef} />
      </div>
      {toolInvocation.state !== "result" && (
        <div className="w-full flex py-4 gap-px items-center justify-start text-zinc-500 text-xs font-mono">
          <span className="mr-2">Interviewing with user </span>
          <span className="animate-bounce">✨ </span>
          {/* <span className="animate-bounce">·</span> */}
          {/* <span className="animate-bounce [animation-delay:0.2s]">·</span> */}
          {/* <span className="animate-bounce [animation-delay:0.4s]">·</span> */}
        </div>
      )}
      {analyst && (
        <div className="bg-accent/40 rounded-lg p-6 border">
          <div className="flex items-start gap-3">
            <div className="mt-1 rounded-md bg-background p-2 border">📝</div>
            <div className="flex-1">
              <div className="text-sm font-medium mb-2">研究主题</div>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {analyst.topic}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewChat;
