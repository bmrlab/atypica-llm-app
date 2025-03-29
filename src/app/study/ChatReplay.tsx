"use client";
import HippyGhostAvatar from "@/components/HippyGhostAvatar";
import { useScrollToBottom } from "@/components/use-scroll-to-bottom";
import { StudyUserChat } from "@/data";
import { useProgressiveMessages } from "./hooks/useProgressiveMessages";
import { SingleMessage } from "./SingleMessage";

export function ChatReplay({ studyUserChat }: { studyUserChat: StudyUserChat }) {
  const { partialMessages: messagesDisplay } = useProgressiveMessages({
    uniqueId: `studyUserChat-${studyUserChat.id}`,
    messages: studyUserChat.messages,
    enabled: true,
  });
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();
  return (
    <>
      <div
        ref={messagesContainerRef}
        className="flex-1 flex flex-col pb-24 w-full items-center overflow-y-scroll"
      >
        {messagesDisplay.map((message, index) => (
          <SingleMessage
            key={message.id}
            addToolResult={() => {}}
            message={message}
            avatar={{ assistant: <HippyGhostAvatar seed={studyUserChat.id} /> }}
            isLastMessage={index === messagesDisplay.length - 1}
          ></SingleMessage>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </>
  );
}
