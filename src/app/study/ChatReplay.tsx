"use client";
import HippyGhostAvatar from "@/components/HippyGhostAvatar";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { StudyUserChat } from "@/data";
import { SingleMessage } from "./SingleMessage";
import { useProgressiveMessages } from "./hooks/useProgressiveMessages";

export function ChatReplay({ studyChat }: { studyChat: StudyUserChat }) {
  const { partialMessages: messagesDisplay } = useProgressiveMessages({
    messages: studyChat.messages,
    enabled: true,
  });
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();
  return (
    <>
      <div
        ref={messagesContainerRef}
        className="flex-1 flex flex-col pb-24 w-full items-center overflow-y-scroll"
      >
        {messagesDisplay.map((message) => (
          <SingleMessage
            key={message.id}
            avatar={{ assistant: <HippyGhostAvatar seed={studyChat.id} /> }}
            role={message.role}
            content={message.content}
            parts={message.parts}
          ></SingleMessage>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </>
  );
}
