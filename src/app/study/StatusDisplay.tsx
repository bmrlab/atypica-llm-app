"use client";
import { Message } from "ai";
import { useTranslations } from "next-intl";

export function StatusDisplay({ status }: { chatId: number; status: string; messages: Message[] }) {
  const t = useTranslations("StudyPage.StatusDisplay");
  const getStatusMessage = (status: string) => {
    switch (status) {
      case "streaming":
        return t("thinking");
      case "submitted":
        return t("processing");
      case "complete":
        return t("complete");
      case "error":
        return t("error");
      case "ready":
        return t("ready");
      default:
        return "";
    }
  };

  if (!status) return null;

  return (
    <div className="flex gap-2 justify-center items-center text-primary">
      {status === "streaming" && (
        <div className="flex gap-1">
          <span className="animate-bounce">·</span>
          <span className="animate-bounce [animation-delay:0.2s]">·</span>
          <span className="animate-bounce [animation-delay:0.4s]">·</span>
        </div>
      )}
      <span className="text-xs tracking-wider font-medium">{getStatusMessage(status)}</span>
    </div>
  );
}
