"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Analyst, AnalystInterview, Persona } from "@/data";
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
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function AnalystDetail({
  analyst,
  interviews,
}: {
  analyst: Analyst;
  interviews: (AnalystInterview & { persona: Persona })[];
}) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [personas, setPersonas] = useState<Persona[]>([]);

  const addPersona = async () => {
    const response = await fetch("/personas/api");
    if (response.ok) {
      const personas = await response.json();
      setPersonas(personas);
      setIsOpen(true);
    }
  };

  return (
    <div className="container mx-auto py-12 max-w-4xl">
      <div className="flex flex-col items-center space-y-8">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">{analyst.role}</CardTitle>
            <CardDescription className="mt-4 whitespace-pre-wrap">
              {analyst.topic}
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">访谈列表</h2>
            <Button variant="outline" onClick={addPersona}>
              添加访谈对象
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {interviews.map((interview) => (
              <Card key={interview.id} className="w-full">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{interview.persona.name}</CardTitle>
                    <Button
                      variant="outline"
                      onClick={() =>
                        router.push(
                          `/analyst/${analyst.id}/interview/${interview.personaId}`,
                        )
                      }
                    >
                      开始访谈
                    </Button>
                  </div>
                  <CardDescription className="mt-2">
                    {interview.persona.tags.join(", ")}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-6xl">
            <DialogHeader>
              <DialogTitle>选择访谈对象</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-4 gap-4 mt-4 max-h-[60vh] overflow-y-auto">
              {personas.map((persona) => (
                <Card
                  key={persona.id}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={async () => {
                    const response = await fetch(
                      `/analyst/${analyst.id}/interview/${persona.id}/api`,
                      {
                        method: "POST",
                      },
                    );
                    if (response.ok) {
                      setIsOpen(false);
                      router.refresh();
                    }
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
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
