"use client";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ClipboardCopyIcon, RotateCcwIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function AnalystReportShareButton({
  publicReportUrl,
  children,
}: {
  publicReportUrl: string;
  children?: React.ReactNode;
}) {
  const t = useTranslations("StudyPage.AnalystReportShareButton");
  const [open, setOpen] = useState(false);
  const fullUrl = `${window.location.origin}${publicReportUrl}`;

  const handleCopyUrl = useCallback(() => {
    navigator.clipboard.writeText(fullUrl);
    toast.success(t("copySuccess"));
  }, [t, fullUrl]);

  return (
    <AlertDialog
      open={open}
      onOpenChange={(open) => {
        if (open) setOpen(true);
      }}
    >
      <AlertDialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm">
            <RotateCcwIcon size={16} /> {t("viewReport")}
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("title")}</AlertDialogTitle>
          <AlertDialogDescription></AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-3 overflow-hidden">
          <p className="text-sm text-muted-foreground mb-2">{t("successMessage")}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="bg-muted p-2 rounded-md text-xs flex-1 overflow-hidden break-words">
              {fullUrl}
            </div>
            <Button size="sm" variant="outline" onClick={handleCopyUrl} className="shrink-0">
              <ClipboardCopyIcon size={16} className="mr-1" />
              {t("copyButton")}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{t("openInstructions")}</p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setOpen(false)}>{t("closeButton")}</AlertDialogCancel>
          <Button onClick={() => window.open(fullUrl, "_blank")}>{t("openButton")}</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
