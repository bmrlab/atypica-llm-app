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

export default function PersonasList({ personas }: { personas: Persona[] }) {
  const router = useRouter();
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);

  return (
    <div className="mx-auto py-12 max-w-6xl">
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
                <CardDescription>
                  <div className="text-xs text-muted-foreground">
                    来源：{persona.source}
                  </div>
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
              <DialogDescription>
                <div className="text-xs text-muted-foreground">
                  来源：{selectedPersona?.source}
                </div>
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
