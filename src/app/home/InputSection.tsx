"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createUserChat } from "@/data";
import { ArrowRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function InputSection() {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsLoading(true);
    try {
      const chat = await createUserChat("study", {
        role: "user",
        content: input,
      });
      router.push(`/study/?id=${chat.id}`);
    } catch (error) {
      console.error("Error saving input:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="你在想什么"
          className="min-h-32 resize-none focus-visible:ring-primary rounded-3xl p-5"
          disabled={isLoading}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
              e.preventDefault();
              if (input.trim()) {
                const form = e.currentTarget.form;
                if (form) form.requestSubmit();
              }
            }
          }}
        />
        <Button
          type="submit"
          variant="secondary"
          disabled={isLoading || !input.trim()}
          className="rounded-full size-9 absolute right-4 bottom-4"
        >
          <ArrowRightIcon className="h-4 w-4 text-gray-400" />
        </Button>
      </form>
    </div>
  );
}
