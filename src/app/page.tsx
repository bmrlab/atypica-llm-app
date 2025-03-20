"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createUserChat } from "@/data";
import { ArrowRightIcon, SendIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
    <div className="max-w-3xl mx-auto px-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border-2 border-primary/20 hover:border-primary/40 transition-all duration-300 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-medium mb-2">
              <SendIcon className="h-5 w-5" />
              <h3 className="text-lg">输入您要研究的市场或产品</h3>
            </div>

            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder=""
              className="min-h-32 text-base resize-none focus-visible:ring-primary"
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

            <div className="flex justify-end">
              <Button
                type="submit"
                variant="default"
                size="lg"
                disabled={isLoading || !input.trim()}
                className="group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  🔍 开始
                  <ArrowRightIcon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-primary to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function FeatureSection() {
  return (
    <div className="grid gap-6 sm:gap-8 md:gap-12 max-w-4xl mx-auto">
      <Link href="/analyst" className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="group relative overflow-hidden border-2 rounded-lg hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-white dark:bg-black">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/0 group-hover:translate-x-full transition-transform duration-500" />
          <div className="p-4 sm:p-8">
            <div className="flex items-start gap-4 sm:gap-6">
              <span className="flex items-center justify-center size-8 sm:size-12 rounded-md sm:rounded-2xl bg-primary text-lg sm:text-2xl font-semibold text-primary-foreground shrink-0">
                1
              </span>
              <div className="space-y-1 sm:space-y-3">
                <h3 className="text-lg sm:text-2xl font-semibold">开始用户访谈</h3>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  让 AI
                  扮演专业分析师，通过深度访谈发现用户真实需求。突破传统调研局限，获得更深层的用户洞察。
                </p>
              </div>
            </div>
          </div>
        </div>
      </Link>

      <Link href="/personas" className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
        <div className="group relative overflow-hidden border-2 rounded-lg hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-white dark:bg-black">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/0 group-hover:translate-x-full transition-transform duration-500" />
          <div className="p-4 sm:p-8">
            <div className="flex items-start gap-4 sm:gap-6">
              <span className="flex items-center justify-center size-8 sm:size-12 rounded-md sm:rounded-2xl bg-primary text-lg sm:text-2xl font-semibold text-primary-foreground shrink-0">
                2
              </span>
              <div className="space-y-1 sm:space-y-3">
                <h3 className="text-lg sm:text-2xl font-semibold">查看用户画像</h3>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  基于深度访谈数据，AI
                  自动构建立体用户画像。发现用户行为模式，预测潜在需求，为产品决策提供支持。
                </p>
              </div>
            </div>
          </div>
        </div>
      </Link>

      <Link href="/scout" className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
        <div className="group relative overflow-hidden border-2 rounded-lg hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-white dark:bg-black">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/0 group-hover:translate-x-full transition-transform duration-500" />
          <div className="p-4 sm:p-8">
            <div className="flex items-start gap-4 sm:gap-6">
              <span className="flex items-center justify-center size-8 sm:size-12 rounded-md sm:rounded-2xl bg-primary text-lg sm:text-2xl font-semibold text-primary-foreground shrink-0">
                3
              </span>
              <div className="space-y-1 sm:space-y-3">
                <h3 className="text-lg sm:text-2xl font-semibold">发现新机会</h3>
                <p className="text-sm sm:text-base leading-relaxed text-muted-foreground">
                  突破固有思维，探索新的市场机会。让 AI 帮助你发现新的用户群体，开拓新的市场空间。
                </p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <div className="max-w-6xl mx-auto py-12 sm:py-24 space-y-12 sm:space-y-24">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl sm:text-6xl font-bold leading-tight tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Atypica LLM
          </h1>
          <p className="text-base sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000">
            为「主观世界」建模
          </p>
        </div>

        {/* Features Section */}
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <InputSection />
        </div>

        <div className="hidden">
          <FeatureSection />
        </div>
      </div>
    </div>
  );
}
