"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CircleCheckBig, LoaderCircle } from "lucide-react";
import Link from "next/link";

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
}

export function ReportDialog({ open, onOpenChange, src }: ReportDialogProps) {
  const analystId = src.split("/")[2]; // Extract analyst ID from src URL
  const [hasReport, setHasReport] = useState(false);

  // Check if report is generated
  useEffect(() => {
    if (open) {
      const checkReport = async () => {
        const response = await fetch(`/analyst/api?id=${analystId}`);
        const analyst = await response.json();
        setHasReport(!!analyst.report);
      };

      const intervalId = setInterval(checkReport, 5000);
      return () => clearInterval(intervalId);
    }
  }, [open, analystId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal>
      <DialogContent
        className="sm:max-w-[80vw]"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-4">
          <DialogTitle className="flex items-center gap-2">
            {hasReport ? (
              <>
                <CircleCheckBig className="text-green-600" />
                报告已生成
              </>
            ) : (
              <>
                <LoaderCircle className="animate-spin text-orange-300" />
                生成报告中
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
              {hasReport
                ? "报告生成完成，请点击下方按钮查看完整报告。"
                : "正在生成研究报告，请勿关闭此窗口。生成完成后会自动提示。"}
            </p>
          </div>
        </DialogHeader>
        <div className="h-[70vh]">
          <iframe src={src} className="w-full h-full border-none"></iframe>
        </div>
        <div className="flex justify-end gap-2">
          {hasReport && (
            <Button asChild variant="default" size="sm">
              <Link href={`/analyst/${analystId}/html`} target="_blank">
                查看报告
              </Link>
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
