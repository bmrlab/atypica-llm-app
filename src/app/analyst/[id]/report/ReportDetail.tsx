"use client";
import { Button } from "@/components/ui/button";
import { useChat } from "@ai-sdk/react";

export default function ReportDetail({ analystId }: { analystId: number }) {
  const { messages, setMessages, append } = useChat({
    api: "/analyst/api/chat/report",
    body: {
      analystId,
    },
    onFinish: (message) => {
      console.log("Received message:", message);
    },
  });

  return (
    <div>
      <div className="flex items-center justify-center my-6">
        <Button
          size="sm"
          onClick={() => {
            setMessages([]);
            append({ content: "Hello, world!", role: "user" });
          }}
        >
          生成报告
        </Button>
      </div>
      <div>
        {messages
          .filter((message) => message.role === "assistant")
          .slice(-1)
          .map((message) => (
            <div key={message.id}>
              <div dangerouslySetInnerHTML={{ __html: message.content }} />
            </div>
          ))}
      </div>
    </div>
  );
}
