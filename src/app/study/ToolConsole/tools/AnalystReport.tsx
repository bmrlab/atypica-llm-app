import { encryptAnalystReportUrl } from "@/app/analyst/report/encrypt";
import { fetchAnalystById } from "@/data";
import { cn } from "@/lib/utils";
import { AnalystReportResult } from "@/tools/experts/report";
import { ToolInvocation } from "ai";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnalystReportShareButton } from "./AnalystReportShareButton";

const AnalystReport = ({ toolInvocation }: { toolInvocation: ToolInvocation }) => {
  const t = useTranslations("StudyPage.ToolConsole");
  const result = useMemo(() => {
    if (toolInvocation.state === "result") {
      return toolInvocation.result as AnalystReportResult;
    }
  }, [toolInvocation]);

  const [hasReport, setHasReport] = useState(false);
  const [publicReportUrl, setPublicReportUrl] = useState<string | null>(null);
  const checkReport = useCallback(async () => {
    if (!result?.analystId) {
      return;
    }
    try {
      const analyst = await fetchAnalystById(result.analystId);
      setHasReport(!!analyst.report);
      const url = await encryptAnalystReportUrl(analyst.id);
      setPublicReportUrl(url);
    } catch (error) {
      console.log("Error fetching analyst:", error);
    }
  }, [result?.analystId]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const poll = async () => {
      timeoutId = setTimeout(poll, 5000); // 要放在前面，不然下面 return () 的时候如果 fetchUpdate 还没完成就不会 clearTimeout 了
      await checkReport();
    };
    poll();
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [checkReport]);

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

  return (
    <div className="h-full relative pb-10">
      <div className="h-full" ref={containerRef}>
        {result && (
          <iframe
            src={`/analyst/${result.analystId}/live`}
            className={cn("w-[1200px]")}
            style={{
              transform: `scale(${ratio / 100})`,
              transformOrigin: "top left",
              height: iframeHeight,
            }}
          />
        )}
      </div>
      {hasReport && publicReportUrl ? (
        <div className="absolute right-0 bottom-0">
          {/* <Button asChild variant="ghost" size="sm">
            <Link href={publicReportUrl} target="_blank">
              {t("shareReport")}
            </Link>
          </Button> */}
          <AnalystReportShareButton publicReportUrl={publicReportUrl} />
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

export default AnalystReport;
