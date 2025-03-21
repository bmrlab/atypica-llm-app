"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import UserMenu from "@/components/UserMenu";
import { createUserChat } from "@/data";
import { ArrowRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { StudyHistoryDrawer } from "../components/HistoryDrawer";

export default function Home() {
  return (
    <div className="min-h-screen max-w-6xl mx-auto py-12 sm:py-24 space-y-12 sm:space-y-24">
      <div className="text-center space-y-6">
        <h1 className="text-4xl sm:text-6xl font-normal leading-tight tracking-wide bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">
          Atypica LLM
        </h1>
        <p className="text-base sm:text-2xl font-light text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000">
          为「主观世界」建模
        </p>
      </div>
      <div className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 p-3">
        <InputSection />
      </div>
      <div className="fixed left-2 top-2 sm:top-4 sm:left-4">
        <StudyHistoryDrawer />
      </div>
      <div className="fixed right-2 top-2 sm:top-4 sm:right-4">
        <UserMenu />
      </div>
    </div>
  );
}

function InputSection() {
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
