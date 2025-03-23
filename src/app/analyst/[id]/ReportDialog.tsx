"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { fetchAnalystById } from "@/data";
import { CircleCheckBig, LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useEffect, useState } from "react";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analystId: number;
}

export function ReportDialog({ open, onOpenChange, analystId }: ReportDialogProps) {
  const t = useTranslations("AnalystPage.ReportDialog");
  const [hasReport, setHasReport] = useState(false);

  // Check if report is generated
  useEffect(() => {
    if (open) {
      const checkReport = async () => {
        try {
          const analyst = await fetchAnalystById(analystId);
          setHasReport(!!analyst.report);
        } catch (error) {
          console.log("Error fetching analyst:", error);
        }
      };
      const intervalId = setInterval(checkReport, 5000);
      return () => clearInterval(intervalId);
    }
  }, [open, analystId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent className="sm:max-w-[80vw]" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader className="space-y-4">
          <DialogTitle className="flex items-center gap-2">
            {hasReport ? (
              <>
                <CircleCheckBig className="text-green-600" />
                {t("reportGenerated")}
              </>
            ) : (
              <>
                <LoaderCircle className="animate-spin text-orange-300" />
                {t("generatingReport")}
              </>
            )}
          </DialogTitle>
          <div
            className={`border px-4 py-3 rounded-lg ${
              hasReport
                ? "bg-green-100 dark:bg-green-950 border-green-200 dark:border-green-900"
                : "bg-orange-100 dark:bg-orange-950 border-orange-200 dark:border-orange-900"
            }`}
          >
            <p
              className={`text-sm ${
                hasReport
                  ? "text-green-700 dark:text-green-300"
                  : "text-orange-700 dark:text-orange-300"
              }`}
            >
              {hasReport ? t("completeMessage") : t("waitMessage")}
            </p>
          </div>
        </DialogHeader>
        <div className="h-[70vh]">
          <iframe src={`/analyst/${analystId}/live`} className="w-full h-full border-none"></iframe>
        </div>
        <div className="flex justify-end gap-2">
          {hasReport && (
            <Button asChild variant="default" size="sm">
              <Link href={`/analyst/${analystId}/html`} target="_blank">
                {t("viewReport")}
              </Link>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
