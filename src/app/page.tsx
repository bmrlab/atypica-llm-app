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
      <div className="flex flex-col gap-4 w-full max-w-2xl">
        <Link href="/analyst">
          <Card className="hover:bg-accent/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                  1
                </span>
                <span className="text-lg">选择主题开始访谈</span>
              </CardTitle>
              <CardDescription className="text-base pl-11">
                选择一个主题，让AI帮你发现和分析独特的用户群体
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/personas">
          <Card className="hover:bg-accent/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                  2
                </span>
                <span className="text-lg">查看用户分析</span>
              </CardTitle>
              <CardDescription className="text-base pl-11">
                查看AI构建的用户画像和分析报告
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
        <Link href="/scout">
          <Card className="hover:bg-accent/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground">
                  3
                </span>
                <span className="text-lg">探索新话题</span>
              </CardTitle>
              <CardDescription className="text-base pl-11">
                使用不同话题寻找新的用户群体
              </CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}
