import { Button } from "@/components/ui/button";
import { fetchAnalystById } from "@/data";
import { cn } from "@/lib/utils";
import { AnalystReportResult } from "@/tools/experts/report";
import { ToolInvocation } from "ai";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const AnalystReport = ({ toolInvocation }: { toolInvocation: ToolInvocation }) => {
  const result = useMemo(() => {
    if (toolInvocation.state === "result") {
      return toolInvocation.result as AnalystReportResult;
    }
  }, [toolInvocation]);

  const [hasReport, setHasReport] = useState(false);
  const checkReport = useCallback(async () => {
    if (!result?.analystId) {
      return;
    }
    try {
      const analyst = await fetchAnalystById(result.analystId);
      setHasReport(!!analyst.report);
    } catch (error) {
      console.log("Error fetching analyst:", error);
    }
  }, [result?.analystId]);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const poll = async () => {
      await checkReport();
      timeoutId = setTimeout(poll, 5000);
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

  return result ? (
    <div className="h-full relative pb-10">
      <div className="h-full" ref={containerRef}>
        <iframe
          src={result.url}
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
          <Button asChild variant="ghost" size="sm">
            <Link href={`/analyst/${result.analystId}/html`} target="_blank">
              分享报告
            </Link>
          </Button>
        )}
      </div>
    </div>
  ) : null;
};

export default AnalystReport;
