"use client";
import { useState } from "react";
import { Analyst } from "@/data";
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
    const response = await fetch("/analyst/api", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role, topic }),
    });

    if (response.ok) {
      const newAnalyst = await response.json();
      setAnalysts([...analysts, newAnalyst]);
      setIsOpen(false);
      setRole("");
      setTopic("");
      router.refresh();
    }
  };

  return (
    <div className="container mx-auto py-12 max-w-2xl">
      <div className="flex flex-col items-center space-y-8">
        <h1 className="text-3xl font-bold">分析师</h1>

        <div className="w-full space-y-4">
          {analysts.map((analyst) => (
            <Card key={analyst.id} className="w-full">
              <CardHeader>
                <CardTitle className="text-xl flex flex-row items-center justify-between">
                  <div>{analyst.role}</div>
                  <Button
                    size="sm"
                    onClick={() => router.push(`/analyst/${analyst.id}`)}
                    variant="outline"
                    className="ml-auto"
                  >
                    查看详情
                  </Button>
                </CardTitle>
                <CardDescription className="mt-2 whitespace-pre-wrap">
                  {analyst.topic}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="mt-4">
              创建新分析师
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>创建新分析师</DialogTitle>
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
  );
}
