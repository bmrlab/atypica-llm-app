"use client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { setUserChatToken, StudyUserChat } from "@/data";
import { ClipboardCopyIcon, RotateCcwIcon } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function ShareReplayButton({ studyChat }: { studyChat: StudyUserChat }) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const handleShareReplay = useCallback(async () => {
    setIsLoading(true);
    setShareUrl(null);
    try {
      const chatWithToken = await setUserChatToken(studyChat.id, "study");
      if (chatWithToken.token) {
        const url = `${window.location.origin}/study/${chatWithToken.token}/share?replay=1`;
        setShareUrl(url);
      }
    } catch (error) {
      console.error("Failed to create share link:", error);
      toast.error("创建回放分享链接失败，请稍后再试");
    } finally {
      setIsLoading(false);
    }
  }, [studyChat]);
  const handleCopyUrl = useCallback(() => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast.success("链接已复制到剪贴板");
    }
  }, [shareUrl]);
  return (
    <AlertDialog
      open={open}
      onOpenChange={(open) => {
        if (open) setOpen(true);
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="sm" disabled={isLoading}>
          <RotateCcwIcon size={16} /> {isLoading ? "生成中..." : "分享回放"}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>生成回放分享链接</AlertDialogTitle>
          <AlertDialogDescription></AlertDialogDescription>
        </AlertDialogHeader>
        {!shareUrl &&
          !isLoading &&
          "将生成回放分享链接，其他人可以通过该链接直接访问这个会话的回放。要继续吗？"}
        {isLoading && "正在生成回放分享链接，请稍候..."}
        {shareUrl && (
          <div className="mt-3 space-y-3">
            <p className="text-sm text-muted-foreground mb-2">
              回放分享链接已生成，其他人可以通过此链接访问会话回放：
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="bg-muted p-2 rounded-md text-xs overflow-hidden text-ellipsis flex-1">
                {shareUrl}
              </div>
              <Button size="sm" variant="outline" onClick={handleCopyUrl} className="shrink-0">
                <ClipboardCopyIcon size={16} className="mr-1" />
                复制
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              您也可以点击下方的&quot;打开&quot;按钮在新标签页中查看。
            </p>
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setOpen(false)}>
            {shareUrl ? "关闭" : "取消"}
          </AlertDialogCancel>
          {!shareUrl ? (
            <AlertDialogAction onClick={handleShareReplay} disabled={isLoading}>
              {isLoading ? "生成中..." : "确认"}
            </AlertDialogAction>
          ) : (
            <Button onClick={() => window.open(shareUrl, "_blank")}>打开</Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
