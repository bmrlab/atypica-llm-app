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
  analyst,
  interviews,
}: {
  analyst: Analyst;
  interviews: (AnalystInterview & { persona: Persona })[];
}) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const addPersona = () => {
    setIsOpen(true);
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
          开始对话 ({pendingCount})
        </Button>
      </PointAlertDialog>
    );
  }, [analyst, interviews, router]);

  return (
    <div className="mx-auto py-12 max-w-4xl">
      <div className="w-full flex flex-col items-center space-y-8">
        {/* <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">{analyst.role}</CardTitle>
            <CardDescription className="mt-4 whitespace-pre-wrap">
              {analyst.topic}
            </CardDescription>
          </CardHeader>
        </Card> */}

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
              </div>
            </div>
          </div>
        </div>

        <div className="w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">访谈列表</h2>
            <div className="flex gap-2">
              {pointsDialog}
              <Button variant="outline" onClick={addPersona}>
                添加访谈对象
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {interviews.map((interview) => (
              <Card key={interview.id} className="w-full">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>
                      <div className="line-clamp-1">
                        {interview.persona.name}
                      </div>
                    </CardTitle>
                  </div>
                  <CardDescription className="mt-2">
                    <div className="line-clamp-2">
                      {interview.persona.tags.join(", ")}
                    </div>
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
                    访谈 →
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
