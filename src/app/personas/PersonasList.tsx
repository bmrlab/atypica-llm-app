"use client";
import { Persona } from "@/data";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PersonasList({ personas }: { personas: Persona[] }) {
  const router = useRouter();
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

  return (
    <div className="py-12 max-w-6xl mx-auto">
      <div className="w-full flex flex-col space-y-8">
        <div className="relative w-full">
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
          <h1 className="text-xl font-medium text-center">用户画像</h1>
        </div>

        <div className="mb-8">
          <div className="bg-muted/50 rounded-lg p-6">
            <div className="font-medium mb-2">💡 小贴士</div>
            <ul className="text-sm ml-4 list-disc space-y-1 text-muted-foreground">
              <li>
                在
                <Link
                  href="/scout"
                  className="text-blue-500 hover:underline mx-1"
                >
                  🔍 用户发现
                </Link>
                页面，AI 可以帮你找到更多潜在的目标用户
              </li>
              <li>
                每个用户画像都可以在
                <Link
                  href="/analyst"
                  className="text-blue-500 hover:underline mx-1"
                >
                  🎯 深度访谈
                </Link>
                中使用，帮助你更好地理解用户需求
              </li>
              <li>点击用户卡片可以查看完整的用户画像信息</li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {personas.map((persona) => (
            <Card
              key={persona.id}
              className="transition-all duration-300 hover:bg-accent/50 cursor-pointer hover:shadow-md"
              onClick={() => setSelectedPersona(persona)}
            >
              <CardHeader>
                <CardTitle className="text-lg line-clamp-1">
                  {persona.name}
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  来源：{persona.source}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="line-clamp-2 text-sm">{persona.prompt}</div>
              </CardContent>
              <CardFooter>
                <div className="flex flex-wrap gap-1.5">
                  {persona.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        <Dialog
          open={!!selectedPersona}
          onOpenChange={() => setSelectedPersona(null)}
        >
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedPersona?.name}</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                来源：{selectedPersona?.source}
              </DialogDescription>
            </DialogHeader>
            <div className="bg-muted/50 rounded-lg p-4 max-h-[60vh] overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap font-mono">
                {selectedPersona?.prompt}
              </pre>
            </div>
            <DialogFooter>
              <div className="flex flex-wrap gap-2">
                {selectedPersona?.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
