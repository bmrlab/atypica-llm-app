import Link from "next/link";
import { AnalystInterview, Persona } from "@/data";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { CircleCheckBig, LoaderCircle } from "lucide-react";

interface InterviewCardProps {
  interview: AnalystInterview & { persona: Persona };
}

export function InterviewCard({ interview }: InterviewCardProps) {
  return (
    <Card key={interview.id} className="w-full">
      <CardHeader>
        <CardTitle className="line-clamp-1">{interview.persona.name}</CardTitle>
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
  );
}