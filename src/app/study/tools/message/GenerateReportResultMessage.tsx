import { AnalystReport, fetchAnalystReportById } from "@/data";
import { GenerateReportResult } from "@/tools/experts/report";
import { useTranslations } from "next-intl";
import { FC, useEffect, useState } from "react";
import { AnalystReportShareButton } from "../AnalystReportShareButton";

export const GenerateReportResultMessage: FC<{
  result: GenerateReportResult;
}> = ({ result: { reportId } }) => {
  const t = useTranslations("StudyPage.ToolMessage");
  const [report, setReport] = useState<AnalystReport | null>(null);

  useEffect(() => {
    (async () => {
      const report = await fetchAnalystReportById(reportId);
      setReport(report);
    })();
  }, [reportId]);

  if (!report) return null;

  return (
    <div className="">
      <div className="text-sm mt-4 mb-2">{t("reportGenerated")}</div>
      {/* <Link
        className="block mb-4 w-[360px] h-[180px] [&>svg]:w-[360px] [&>svg]:h-[180px] cursor-pointer border border-input/50 rounded-md overflow-hidden"
        href={`/analyst/report/${report.token}`}
        target="_blank"
        dangerouslySetInnerHTML={{ __html: report.coverSvg }}
      ></Link> */}
      <AnalystReportShareButton publicReportUrl={`/analyst/report/${report.token}`}>
        <div
          className="block mb-4 w-[360px] h-[180px] [&>svg]:w-[360px] [&>svg]:h-[180px] cursor-pointer border border-input/50 rounded-md overflow-hidden"
          dangerouslySetInnerHTML={{ __html: report.coverSvg }}
        ></div>
      </AnalystReportShareButton>
    </div>
  );
};
