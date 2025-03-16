"use client";

import { useEffect, useState } from "react";
import { fetchPersonas, Persona, upsertAnalystInterview } from "@/data";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface SelectPersonaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analystId: number;
  onSuccess: () => void;
}

export function SelectPersonaDialog({
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
      fetchPersonas()
        .then((personas) => {
          setPersonas(personas);
          setSelectedIds([]);
        })
        .finally(() => setLoading(false));
    }
  }, [open]);

  const handleSubmit = async () => {
    try {
      for (const personaId of selectedIds) {
        await upsertAnalystInterview({ analystId, personaId });
      }
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(`无法保存访谈对象 ${error}`);
    }
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
                  className={`gap-3 cursor-pointer transition-colors ${
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
                  <CardHeader>
                    <CardTitle className="truncate">{persona.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground text-xs line-clamp-2">
                    {persona.prompt}
                  </CardContent>
                  <CardFooter className="text-xs line-clamp-1 text-muted-foreground">
                    {persona.tags.join(", ")}
                  </CardFooter>
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
