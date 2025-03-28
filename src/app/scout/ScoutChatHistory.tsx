"use client";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { fetchUserChatById, fetchUserChats, ScoutUserChat } from "@/data";
import { HistoryIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export function ScoutChatHistory({
  onSelectChat,
}: {
  onSelectChat: (chat: ScoutUserChat | null) => void;
}) {
  const t = useTranslations("ScoutPage.HistoryDrawer");
  const [chats, setChats] = useState<Omit<ScoutUserChat, "messages">[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const chats = await fetchUserChats("scout");
        setChats(chats);
      } catch (error) {
        console.error("Failed to fetch active chats:", error);
      }
    };
    fetchChats();
    const interval = setInterval(() => {
      fetchChats();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectChat = async (scoutUserChatId: number | null) => {
    if (!scoutUserChatId) {
      onSelectChat(null);
    } else {
      const scoutUserChat = await fetchUserChatById(scoutUserChatId, "scout");
      onSelectChat(scoutUserChat);
    }
    setOpen(false); // Close drawer when a chat is selected
  };

  return (
    <Drawer direction="right" open={open} onOpenChange={setOpen} modal={true}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon">
          <HistoryIcon className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="w-[280px] mr-0 ml-auto">
        <DrawerHeader>
          <DrawerTitle className="text-center">{t("title")}</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-2">
          <div
            className="px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-100 rounded cursor-pointer"
            onClick={() => handleSelectChat(null)}
          >
            {t("newChat")}
          </div>
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => handleSelectChat(chat.id)}
              className="px-3 py-2 text-sm truncate text-zinc-500 hover:bg-zinc-100 rounded cursor-pointer"
            >
              {chat.title || t("unnamedChat")}
            </div>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
