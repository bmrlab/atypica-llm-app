"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Analyst, AnalystInterview, Persona } from "@/data";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CircleCheckBig, LoaderCircle } from "lucide-react";
import { PointAlertDialog } from "@/components/PointAlertDialog";

interface SelectPersonaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analystId: number;
  onSuccess: () => void;
}

interface ReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
}

function ReportDialog({ open, onOpenChange, src }: ReportDialogProps) {
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
            <Button
              variant="default"
              onClick={() => {
                window.open(`/analyst/${analystId}/html`, "_blank");
              }}
            >
              查看报告
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SelectPersonaDialog({
  open,
  onOpenChange,
  analystId,
  onSuccess,
}: SelectPersonaDialogProps) {
  const [loading, setLoading] = useState(true);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    if (open) {
      setLoading(true);
      fetch("/personas/api")
        .then((res) => res.json())
        .then((data) => {
          setPersonas(data);
          setSelectedIds([]);
        })
        .finally(() => setLoading(false));
    }
  }, [open]);

  const handleSubmit = async () => {
    for (const personaId of selectedIds) {
      await fetch(`/interview/api`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ analystId, personaId }),
      });
    }
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>选择访谈对象</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-4 mt-4 max-h-[60vh] overflow-y-auto">
              {personas.map((persona) => (
                <Card
                  key={persona.id}
                  className={`cursor-pointer transition-colors ${
                    selectedIds.includes(persona.id)
                      ? "bg-accent"
                      : "hover:bg-accent/50"
                  }`}
                  onClick={() => {
                    setSelectedIds((prev) =>
                      prev.includes(persona.id)
                        ? prev.filter((id) => id !== persona.id)
                        : [...prev, persona.id],
                    );
                  }}
                >
                  <CardHeader className="p-4">
                    <CardTitle className="text-base truncate">
                      {persona.name}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-2">
                      {persona.tags.join(", ")}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
            <div className="flex justify-end space-x-2 mt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={selectedIds.length === 0}
              >
                确定 ({selectedIds.length})
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function AnalystDetail({
  analyst: _analyst,
  interviews,
}: {
  analyst: Analyst;
  interviews: (AnalystInterview & { persona: Persona })[];
}) {
  const router = useRouter();

  const [analyst, setAnalyst] = useState(_analyst);
  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Auto refresh when there are ongoing interviews
  useEffect(() => {
    const hasOngoingInterviews = interviews.some((i) => i.interviewToken);
    if (hasOngoingInterviews && !isRefreshing) {
      const timeoutId = setTimeout(() => {
        setIsRefreshing(true);
        router.refresh();
        setIsRefreshing(false);
      }, 10000);
      return () => clearTimeout(timeoutId);
    }
  }, [interviews, router, isRefreshing]);

  // Poll for report status when generating
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      const response = await fetch(`/analyst/api?id=${analyst.id}`);
      const updatedAnalyst = await response.json();
      setAnalyst(updatedAnalyst);
    }, 5000);
    return () => clearTimeout(timeoutId);
  }, [analyst.id]);

  const addPersona = () => {
    setIsOpen(true);
  };

  const clearReport = async () => {
    await fetch(`/analyst/api?id=${analyst.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...analyst,
        report: "",
      }),
    });
    setAnalyst({ ...analyst, report: "" });
  };
  const pointsDialog = useMemo(() => {
    const pendingCount = interviews.filter(
      (i) => !i.conclusion && !i.interviewToken,
    ).length;
    return (
      <PointAlertDialog
        points={pendingCount * 5}
        onConfirm={async () => {
          const pending = interviews.filter(
            (i) => !i.conclusion && !i.interviewToken,
          );
          for (const interview of pending) {
            await fetch("/interview/api/chat/background", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                analyst,
                persona: interview.persona,
                analystInterviewId: interview.id,
              }),
            });
          }
          router.refresh();
        }}
      >
        <Button variant="default" disabled={pendingCount === 0}>
          开启所有人访谈 ({pendingCount})
        </Button>
      </PointAlertDialog>
    );
  }, [analyst, interviews, router]);

  return (
    <div className="mx-auto py-12 max-w-4xl">
      <div className="w-full flex flex-col items-center space-y-8">
        <div className="w-full">
          <div className="relative w-full">
            <div className="absolute left-0">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                ← 返回
              </Button>
            </div>
            <h1 className="text-center text-xl font-medium mb-4">
              {analyst.role}
            </h1>
          </div>
          <div className="bg-accent/40 rounded-lg p-6 border">
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-md bg-background p-2 border">📝</div>
              <div className="flex-1">
                <div className="text-sm font-medium mb-2">研究主题</div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {analyst.topic}
                </p>
                <div className="mt-4 flex justify-end gap-2">
                  {analyst.report ? (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() =>
                          window.open(`/analyst/${analyst.id}/html`, "_blank")
                        }
                      >
                        查看报告
                      </Button>
                      <PointAlertDialog
                        points={50}
                        onConfirm={async () => {
                          await clearReport();
                          setIsReportOpen(true);
                        }}
                      >
                        <Button variant="outline" size="sm">
                          重新生成报告
                        </Button>
                      </PointAlertDialog>
                    </>
                  ) : (
                    <PointAlertDialog
                      points={100}
                      onConfirm={async () => {
                        await clearReport();
                        setIsReportOpen(true);
                      }}
                    >
                      <Button variant="default" size="sm">
                        生成报告
                      </Button>
                    </PointAlertDialog>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full">
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">访谈列表</h2>
            </div>
            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
              <p>你可以：</p>
              <ul className="list-disc ml-4 mt-1 space-y-1">
                <li>添加更多访谈对象来获取更全面的见解</li>
                <li>
                  选择单个访谈逐一进行，或使用&quot;开启所有人访谈&quot;批量开始
                </li>
                <li>
                  在访谈过程中随时生成报告，也可以在所有访谈结束后生成最终报告
                </li>
              </ul>
            </div>
            <div className="flex items-center justify-end gap-2">
              {pointsDialog}
              <Button variant="outline" onClick={addPersona}>
                添加访谈对象
              </Button>
            </div>

            <ReportDialog
              open={isReportOpen}
              onOpenChange={setIsReportOpen}
              src={`/analyst/${analyst.id}/live`}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            {interviews.map((interview) => (
              <Card key={interview.id} className="w-full">
                <CardHeader>
                  <CardTitle className="line-clamp-1">
                    {interview.persona.name}
                  </CardTitle>
                  <CardDescription className="mt-2 line-clamp-1">
                    {interview.persona.tags.join(", ")}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="justify-between">
                  {interview.interviewToken ? (
                    <div className="flex items-center justify-start gap-2 text-sm">
                      <LoaderCircle className="animate-spin text-orange-300 size-4" />
                      正在访谈
                    </div>
                  ) : interview.conclusion ? (
                    <div className="flex items-center justify-start gap-2 text-sm">
                      <CircleCheckBig className="text-green-600 size-4" />
                      已总结
                    </div>
                  ) : (
                    <div></div>
                  )}
                  <Link
                    href={`/interview/${interview.id}`}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {interview.conclusion ? "查看总结" : "去访谈"} →
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        <SelectPersonaDialog
          open={isOpen}
          onOpenChange={setIsOpen}
          analystId={analyst.id}
          onSuccess={() => router.refresh()}
        />
      </div>
    </div>
  );
}
