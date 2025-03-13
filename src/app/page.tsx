import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-8">
      <div className="text-center space-y-6 mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Atypica LLM</h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          Discover and understand unique personas through AI-powered analysis
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
        <Link href="/scout">
          <Card className="h-full hover:bg-accent/50 transition-colors">
            <CardHeader>
              <CardTitle>Scout</CardTitle>
              <CardDescription>
                Find and analyze unique personalities from Xiaohongshu
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/personas">
          <Card className="h-full hover:bg-accent/50 transition-colors">
            <CardHeader>
              <CardTitle>Personas</CardTitle>
              <CardDescription>
                Deep dive into constructed personas through AI interviews
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/analyst">
          <Card className="h-full hover:bg-accent/50 transition-colors">
            <CardHeader>
              <CardTitle>Topics</CardTitle>
              <CardDescription>
                Explore diverse topics within constructed personas
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/personas">
          <Card className="h-full hover:bg-accent/50 transition-colors">
            <CardHeader>
              <CardTitle>Topics</CardTitle>
              <CardDescription>
                Explore diverse topics within constructed personas
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
