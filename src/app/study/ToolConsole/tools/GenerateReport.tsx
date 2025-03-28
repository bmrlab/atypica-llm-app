import { AnalystReport, fetchAnalystReportById, fetchPendingReportByAnalystId } from "@/data";
import { cn } from "@/lib/utils";
import { GenerateReportResult } from "@/tools/experts/report";
import { ToolInvocation } from "ai";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnalystReportShareButton } from "./AnalystReportShareButton";

const GenerateReport = ({ toolInvocation }: { toolInvocation: ToolInvocation }) => {
  const t = useTranslations("StudyPage.ToolConsole");
  const analystId = toolInvocation.args.analystId as number;

  const containerRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState(100);
  const [iframeHeight, setIframeHeight] = useState(1200);

  const updateDimensions = useCallback(() => {
    const containerWidth = containerRef.current?.clientWidth;
    const containerHeight = containerRef.current?.clientHeight;
    const ratio = Math.floor((containerWidth ? containerWidth / 1200 : 1) * 100);
    setRatio(ratio);
    setIframeHeight(containerHeight ? (containerHeight / ratio) * 100 : 1200);
  }, []);

  // Update dimensions when component mounts and when container changes
  useEffect(() => {
    updateDimensions();
    // Set up ResizeObserver to detect container size changes
    const resizeObserver = new ResizeObserver(() => {
      updateDimensions();
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    // Set up window resize listener
    window.addEventListener("resize", updateDimensions);
    // Set up periodic check for size changes
    const intervalId = setInterval(updateDimensions, 2000);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateDimensions);
      clearInterval(intervalId);
    };
  }, [updateDimensions]);

  const [analystReport, setAnalystReport] = useState<AnalystReport | null>(null);

  const fetchPendingReport = useCallback(async () => {
    try {
      const report = await fetchPendingReportByAnalystId(analystId);
      setAnalystReport(report);
    } catch (error) {
      console.error(error);
    }
  }, [analystId]);

  const fetchAnalystReport = useCallback(async (reportId: number) => {
    try {
      const report = await fetchAnalystReportById(reportId);
      setAnalystReport(report);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (toolInvocation.state === "result") {
      const result = toolInvocation.result as GenerateReportResult;
      fetchAnalystReport(result.reportId);
    } else {
      fetchPendingReport();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toolInvocation.state, fetchAnalystReport, fetchPendingReport]); // toolInvocation.result

  return (
    <div className="h-full relative pb-10">
      <div className="h-full" ref={containerRef}>
        {analystReport && (
          <iframe
            src={`/analyst/report/${analystReport.token}?live=1`}
            className={cn("w-[1200px]")}
            style={{
              transform: `scale(${ratio / 100})`,
              transformOrigin: "top left",
              height: iframeHeight,
            }}
          />
        )}
      </div>
      {analystReport?.generatedAt ? (
        <div className="absolute right-0 bottom-0">
          {/* <Button asChild variant="ghost" size="sm">
            <Link href={publicReportUrl} target="_blank">
              {t("shareReport")}
            </Link>
          </Button> */}
          <AnalystReportShareButton publicReportUrl={`/analyst/report/${analystReport.token}`} />
        </div>
      ) : (
        <div className="flex mt-4 gap-px items-center justify-start text-zinc-500 dark:text-zinc-300 text-xs font-mono">
          <span className="animate-bounce">✨ </span>
          <span className="ml-2">{t("reportBeingGenerated")} </span>
        </div>
      )}
    </div>
  );
};

export default GenerateReport;
