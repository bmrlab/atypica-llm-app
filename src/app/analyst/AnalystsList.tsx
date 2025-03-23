"use client";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Analyst, createAnalyst } from "@/data";
import { PlusIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function AnalystsList({ analysts: initialAnalysts }: { analysts: Analyst[] }) {
  const t = useTranslations("AnalystListPage");
  const [analysts, setAnalysts] = useState(initialAnalysts);
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState("");
  const [topic, setTopic] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newAnalyst = await createAnalyst({ role, topic });
      setAnalysts([newAnalyst, ...analysts]);
      setIsOpen(false);
      setRole("");
      setTopic("");
      router.refresh();
    } catch (error) {
      console.log("Error creating analyst:", error);
    }
  };

  return (
    <div className="mx-auto py-3 sm:py-12 max-w-4xl w-full flex flex-col space-y-8">
      <div className="relative w-full mb-4 sm:mb-8">
        <div className="absolute left-0 top-1/2 -translate-y-1/2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            {t("backButton")}
          </Button>
        </div>
        <h1 className="sm:text-lg font-medium px-18 text-center truncate">{t("researchTopics")}</h1>
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <div>
                <Button variant="default" size="sm" className="hidden sm:block">
                  {t("createNewTopic")}
                </Button>
                <Button variant="ghost" size="sm" className="flex sm:hidden">
                  <PlusIcon />
                  {t("createMobile")}
                </Button>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("topicDialog.title")}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("topicDialog.role")}</label>
                  <Input
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder={t("topicDialog.rolePlaceholder")}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t("topicDialog.topic")}</label>
                  <Textarea
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder={t("topicDialog.topicPlaceholder")}
                    className="min-h-[100px]"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  {t("topicDialog.create")}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-4">
        <div className="bg-muted/50 rounded-lg p-6">
          <h3 className="font-medium mb-2">💡 {t("guide.title")}</h3>
          <ul className="list-disc ml-4 space-y-1 text-sm text-muted-foreground">
            <li>{t("guide.tip1")}</li>
            <li>{t("guide.tip2")}</li>
          </ul>
        </div>
      </div>

      <div className="grid gap-4">
        {analysts.map((analyst) => (
          <Card
            key={analyst.id}
            className="w-full transition-colors hover:bg-accent/50 cursor-pointer"
            onClick={() => router.push(`/analyst/${analyst.id}`)}
          >
            <CardHeader>
              <CardTitle className="text-lg">{analyst.role}</CardTitle>
              <CardDescription className="mt-2 whitespace-pre-wrap line-clamp-4">
                {analyst.topic}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
