import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";

import {
  Analyst,
  fetchAnalystById,
  fetchInterviewByAnalystAndPersona,
  fetchPersonaById,
  Persona,
} from "@/data";
import { fixChatMessages } from "@/lib/utils";
import { ToolName } from "@/tools";
import { Message, ToolInvocation } from "ai";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import { useStudyContext } from "../../hooks/StudyContext";
import { consoleStreamWaitTime, useProgressiveMessages } from "../../hooks/useProgressiveMessages";
import { StreamSteps } from "./StreamSteps";

const InterviewChat = ({ toolInvocation }: { toolInvocation: ToolInvocation }) => {
  const t = useTranslations("StudyPage.ToolConsole");
  const analystId = toolInvocation.args.analystId as number;
  let personasArg = toolInvocation.args.personas as { id: number; name: string }[];
  if (!personasArg || toolInvocation.args.personaId) {
    personasArg = [{ id: toolInvocation.args.personaId, name: "User" }];
  }

  const [analyst, setAnalyst] = useState<Analyst>();
  useEffect(() => {
    (async () => {
      try {
        const analyst = await fetchAnalystById(analystId);
        setAnalyst(analyst);
      } catch (error) {
        console.log("Error fetching userChat:", error);
      }
    })();
  }, [analystId]);

  if (!analyst || !personasArg.length) {
    return <div className="font-mono text-sm">Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-2 items-stretch justify-start w-full h-full">
      <Tabs
        defaultValue={personasArg[0].id.toString()}
        className="flex-1 overflow-hidden flex flex-col items-stretch gap-4"
      >
        {personasArg.map(({ id }) => (
          <TabsContent
            key={id}
            value={id.toString()}
            className="flex-1 overflow-hidden flex flex-col items-stretch"
          >
            <SingleInterviewChat key={id} analyst={analyst} personaId={id}></SingleInterviewChat>
          </TabsContent>
        ))}
        <div className="flex items-center gap-6">
          {toolInvocation.state !== "result" && (
            <div className="flex py-2 gap-px items-center justify-start text-zinc-500 text-xs font-mono">
              <span className="mr-2">{t("interviewing", { count: personasArg.length })} </span>
              <span className="animate-bounce">✨ </span>
              {/* <span className="animate-bounce">·</span> */}
              {/* <span className="animate-bounce [animation-delay:0.2s]">·</span> */}
              {/* <span className="animate-bounce [animation-delay:0.4s]">·</span> */}
            </div>
          )}
          <TabsList className="ml-auto">
            {personasArg.map(({ id, name }) => (
              <TabsTrigger key={id} value={id.toString()} className="max-w-24">
                {name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </Tabs>
      <div className="bg-accent/40 rounded-lg p-6 border">
        <div className="flex items-start gap-3">
          <div className="mt-1 rounded-md bg-background p-2 border">📝</div>
          <div className="flex-1">
            <div className="text-sm font-medium mb-2">{t("researchTopic")}</div>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {analyst.topic}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SingleInterviewChat = ({ analyst, personaId }: { analyst: Analyst; personaId: number }) => {
  const t = useTranslations("StudyPage.ToolConsole");

  const [interviewToken, setInterviewToken] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conclusion, setConclusion] = useState<string | null>(null);
  const [persona, setPersona] = useState<Persona>();

  const fetchUpdate = useCallback(async () => {
    try {
      const [interview, persona] = await Promise.all([
        await fetchInterviewByAnalystAndPersona({ analystId: analyst.id, personaId }),
        await fetchPersonaById(personaId),
      ]);
      // 可能有异常的保存数据，取下来修复一下
      setMessages(fixChatMessages(interview.messages));
      setPersona(persona);
      setInterviewToken(interview.interviewToken);
      setConclusion(interview.conclusion);
    } catch (error) {
      console.log("Error fetching userChat:", error);
    }
  }, [analyst.id, personaId]);

  const { replay } = useStudyContext();
  const { partialMessages: messagesDisplay } = useProgressiveMessages({
    messages: messages,
    enabled: replay,
    fixedDuration: consoleStreamWaitTime(ToolName.interview),
  });

  // 添加定时器效果
  useEffect(() => {
    if (replay) {
      // 如果是 replay 就只取一次
      fetchUpdate();
      return;
    }
    let timeoutId: NodeJS.Timeout;
    const poll = async () => {
      await fetchUpdate();
      timeoutId = setTimeout(poll, 2000);
    };
    poll();
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [fetchUpdate, replay]);

  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();

  return (
    <div ref={messagesContainerRef} className="flex-1 overflow-y-scroll space-y-6">
      {(!persona || !messages.length) && <div className="font-mono text-sm">Loading...</div>}
      {messagesDisplay.map((message) => (
        <StreamSteps
          key={`message-${message.id}`}
          nickname={message.role === "assistant" ? persona?.name : analyst.role}
          role={message.role}
          content={message.content}
          parts={message.parts}
        ></StreamSteps>
      ))}
      {interviewToken && messagesDisplay.length === 0 ? (
        <StreamSteps
          key="message-start"
          nickname="System"
          role="system"
          content="Interview starting.."
        ></StreamSteps>
      ) : null}
      {!interviewToken && conclusion && (!replay || messagesDisplay.length === messages.length) ? (
        <StreamSteps
          key="message-conclusion"
          nickname={t("researchConclusion")}
          role="system"
          content={conclusion}
        ></StreamSteps>
      ) : null}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default InterviewChat;
