import { encryptAnalystReportUrl } from "@/app/analyst/report/encrypt";
import { fetchAnalystById } from "@/data";
import { cn } from "@/lib/utils";
import { AnalystReportResult } from "@/tools/experts/report";
import { ToolInvocation } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnalystReportShareButton } from "./AnalystReportShareButton";

const AnalystReport = ({ toolInvocation }: { toolInvocation: ToolInvocation }) => {
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
  useEffect(() => {
    const containerWidth = containerRef.current?.clientWidth;
    const containerHeight = containerRef.current?.clientHeight;
    const ratio = Math.floor((containerWidth ? containerWidth / 1200 : 1) * 100);
    setRatio(ratio);
    setIframeHeight(containerHeight ? (containerHeight / ratio) * 100 : 1200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef.current]);

  if (!result || !publicReportUrl) return null;

  return (
    <div className="h-full relative pb-10">
      <div className="h-full" ref={containerRef}>
        <iframe
          src={`/analyst/${result.analystId}/live`}
          className={cn("w-[1200px]")}
          style={{
            transform: `scale(${ratio / 100})`,
            transformOrigin: "top left",
            height: iframeHeight,
          }}
        />
      </div>
      <div className="absolute right-0 bottom-0">
        {hasReport && (
          // <Button asChild variant="ghost" size="sm">
          //   <Link href={publicReportUrl} target="_blank">
          //     {t("shareReport")}
          //   </Link>
          // </Button>
          <AnalystReportShareButton publicReportUrl={publicReportUrl} />
        )}
      </div>
    </div>
  );
};

export default AnalystReport;
