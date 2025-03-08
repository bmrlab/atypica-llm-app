"use client";

import { useChat, type Message } from "@ai-sdk/react";

const PartRenderer = ({
  part,
}: {
  part: NonNullable<Message["parts"]>[number];
}) => {
  switch (part.type) {
    case "text":
      return <div>{part.text}</div>;
    case "reasoning":
      return <div>{part.reasoning}</div>;
    case "tool-invocation":
      return <div>{JSON.stringify(part.toolInvocation)}</div>;
    case "source":
      return <div>{JSON.stringify(part.source)}</div>;
  }
};

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    maxSteps: 5,
  });
  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m) => (
        <div key={m.id} className="whitespace-pre-wrap">
          {m.role === "user" ? "User: " : "AI: "}
          {m.parts?.map((part, index) => (
            <div key={index} className="ml-4 mt-2">
              <PartRenderer part={part} />
            </div>
          ))}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed dark:bg-zinc-900 bottom-0 w-full max-w-md p-2 mb-8 border border-zinc-300 dark:border-zinc-800 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
