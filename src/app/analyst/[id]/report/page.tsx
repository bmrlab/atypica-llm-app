import ReportDetail from "./ReportDetail";

export const dynamic = "force-dynamic";

export default async function ReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const analystId = parseInt((await params).id);
  return <ReportDetail analystId={analystId} />;
}
