"use client";
import { Message } from "ai";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useMemo } from "react";

export function StatusDisplay({
  chatId,
  status,
  messages,
}: {
  chatId: number;
  status: string;
  messages: Message[];
}) {
  const t = useTranslations("ScoutPage.status");

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
        return status;
    }
  };

  const personasScouted = useMemo(() => {
    if (status !== "ready") {
      return false;
    }
    for (let i = messages.length - 1; i >= 0; i--) {
      const message = messages[i];
      if (message.role === "assistant" && message.parts) {
        for (let j = message.parts.length - 1; j >= 0; j--) {
          const part = message.parts[j];
          if (
            part.type === "tool-invocation" &&
            part.toolInvocation.toolName === "savePersona" &&
            part.toolInvocation.state === "result"
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }, [status, messages]);

  if (!status) return null;

  return (
    <div className="flex gap-2 justify-center items-center text-zinc-500 dark:text-zinc-400 text-sm">
      {status === "streaming" && (
        <div className="flex gap-1">
          <span className="animate-bounce">·</span>
          <span className="animate-bounce [animation-delay:0.2s]">·</span>
          <span className="animate-bounce [animation-delay:0.4s]">·</span>
        </div>
      )}
      <span>{getStatusMessage(status)}</span>
      {personasScouted && (
        <Link
          href={`/personas?userChat=${chatId}`}
          target="_blank"
          className="text-blue-500 hover:underline mx-1"
        >
          {t("viewPersonas")}
        </Link>
      )}
    </div>
  );
}
