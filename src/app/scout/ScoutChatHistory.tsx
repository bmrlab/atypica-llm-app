"use client";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { fetchUserChats, ScoutUserChat } from "@/data";
import { fixChatMessages } from "@/lib/utils";
import { HistoryIcon } from "lucide-react";
import { useEffect, useState } from "react";

export function ScoutChatHistory({
  onSelectChat,
}: {
  onSelectChat: (chat: ScoutUserChat | null) => void;
}) {
  const [chats, setChats] = useState<ScoutUserChat[]>([]);
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

  const handleSelectChat = (chat: ScoutUserChat | null) => {
    onSelectChat(chat);
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
          <DrawerTitle className="text-center">历史对话</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 space-y-2">
          <div
            className="px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-100 rounded cursor-pointer"
            onClick={() => handleSelectChat(null)}
          >
            新对话
          </div>
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() =>
                handleSelectChat({
                  ...chat,
                  messages: fixChatMessages(chat.messages),
                })
              }
              className="px-3 py-2 text-sm truncate text-zinc-500 hover:bg-zinc-100 rounded cursor-pointer"
            >
              {chat.title || "未命名对话"}
            </div>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
