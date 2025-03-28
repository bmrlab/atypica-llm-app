"use client";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchFeaturedStudyUserChats } from "@/data";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type ExampleCase = {
  title: string;
  replayUrl: string;
};

export function ExampleCards() {
  const router = useRouter();

  const [examples, setExamples] = useState<ExampleCase[]>([]);
  const fetch = useCallback(async () => {
    const examples = await fetchFeaturedStudyUserChats();
    setExamples(examples);
  }, []);
  useEffect(() => {
    fetch();
  }, [fetch]);

  return (
    <div className="space-y-4">
      <h2 className="text-center text-lg font-medium text-muted-foreground mb-6">Gallery</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {examples.map((example, index) => (
          <Card key={index} className="transition-all hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-lg line-clamp-2">{example.title}</CardTitle>
              <CardDescription className="truncate">{example.title}</CardDescription>
            </CardHeader>
            <CardFooter className="justify-end">
              <Button variant="ghost" onClick={() => router.push(example.replayUrl)}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
