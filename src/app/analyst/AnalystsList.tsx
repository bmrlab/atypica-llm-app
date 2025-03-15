"use client";
import { useState } from "react";
import { Analyst, createAnalyst } from "@/data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";

export function AnalystsList({
  analysts: initialAnalysts,
}: {
  analysts: Analyst[];
}) {
  const [analysts, setAnalysts] = useState(initialAnalysts);
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState("");
  const [topic, setTopic] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newAnalyst = await createAnalyst({ role, topic });
    if (newAnalyst) {
      setAnalysts([newAnalyst, ...analysts]);
      setIsOpen(false);
      setRole("");
      setTopic("");
      router.refresh();
    }
  };

  return (
    <div className="mx-auto py-12 max-w-4xl">
      <div className="w-full flex flex-col space-y-8">
        <div className="relative w-full mb-8">
          <div className="absolute left-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="mb-4"
            >
              ← 返回
            </Button>
          </div>
          <h1 className="text-xl font-medium text-center">用户调研主题</h1>
          <div className="absolute right-0 top-0">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm">
                  创建新的主题
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>创建新的主题</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">角色</label>
                    <Input
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="例如：品牌策划师"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">研究主题</label>
                    <Textarea
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="请输入研究主题..."
                      className="min-h-[100px]"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    创建
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="mb-4">
          <div className="bg-muted/50 rounded-lg p-6">
            <h3 className="font-medium mb-2">💡 使用指南</h3>
            <ul className="list-disc ml-4 space-y-1 text-sm text-muted-foreground">
              <li>创建一个研究主题，利用 AI 进行用户访谈</li>
              <li>点击卡片查看访谈对象、访谈内容和完整报告</li>
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
    </div>
  );
}
