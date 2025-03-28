"use client";
import LanguageToggle from "@/components/LanguageToggle";
import ThemeToggle from "@/components/ThemeToggle";
import UserMenu from "@/components/UserMenu";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { StudyHistoryDrawer } from "./HistoryDrawer";
import { InputSection } from "./InputSection";
import { ExampleCards } from "./ExampleCards";

export default function HomePageClient({ anonymous }: { anonymous: boolean }) {
  const t = useTranslations();
  return (
    <div className="min-h-screen max-w-6xl mx-auto py-12 sm:py-24 space-y-12 sm:space-y-24">
      <div className="text-center space-y-6">
        <h1
          className={cn(
            "mt-20 sm:mt-10 text-5xl sm:text-6xl font-mono font-light leading-tight tracking-wide bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000",
            "font-EuclidCircularA font-bold",
            "block dark:hidden",
          )}
        >
          atypica.LLM
        </h1>
        <div
          className={cn(
            "relative w-[450px] h-[100px] mt-20 sm:mt-10 max-w-10/12 mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000",
            "hidden dark:block",
          )}
        >
          <Image
            src="/_public/atypica.llm.svg"
            alt="atypica.LLM Logo"
            fill
            priority
            className="object-contain"
          />
        </div>
        <p
          className={cn(
            "text-base sm:text-xl font-light text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000",
          )}
        >
          {t("tagline")}
        </p>
      </div>
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 px-8">
        <InputSection />
      </div>
      <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000 px-8">
        <ExampleCards />
      </div>
      {!anonymous ? (
        <div className="fixed left-2 top-2 sm:top-4 sm:left-4">
          <StudyHistoryDrawer />
        </div>
      ) : null}
      <div className="fixed right-2 top-2 sm:top-4 sm:right-4 flex items-center justify-end gap-4">
        <ThemeToggle />
        <LanguageToggle />
        <UserMenu />
      </div>
    </div>
  );
}
