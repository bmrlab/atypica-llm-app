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
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function ShareReplayButton({ studyChat }: { studyChat: StudyUserChat }) {
  const t = useTranslations("StudyPage.ShareReplayButton");
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
      toast.error(t("errorMessage"));
    } finally {
      setIsLoading(false);
    }
  }, [t, studyChat]);
  const handleCopyUrl = useCallback(() => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast.success(t("copySuccess"));
    }
  }, [t, shareUrl]);
  return (
    <AlertDialog
      open={open}
      onOpenChange={(open) => {
        if (open) setOpen(true);
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          <RotateCcwIcon size={16} /> {isLoading ? t("generating") : t("shareReplay")}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription></AlertDialogDescription>
        </AlertDialogHeader>
        {!shareUrl && !isLoading && t("description")}
        {isLoading && t("generatingMessage")}
        {shareUrl && (
          <div className="mt-3 space-y-3 overflow-hidden">
            <p className="text-sm text-muted-foreground mb-2">{t("successMessage")}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="bg-muted p-2 rounded-md text-xs flex-1 overflow-hidden break-words">
                {shareUrl}
              </div>
              <Button size="sm" variant="outline" onClick={handleCopyUrl} className="shrink-0">
                <ClipboardCopyIcon size={16} className="mr-1" />
                {t("copyButton")}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{t("openInstructions")}</p>
          </div>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setOpen(false)}>
            {shareUrl ? t("closeButton") : t("cancelButton")}
          </AlertDialogCancel>
          {!shareUrl ? (
            <AlertDialogAction onClick={handleShareReplay} disabled={isLoading}>
              {isLoading ? t("generating") : t("confirmButton")}
            </AlertDialogAction>
          ) : (
            <Button onClick={() => window.open(shareUrl, "_blank")}>{t("openButton")}</Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
