import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-accent/20">
      <div className="max-w-6xl mx-auto px-4 py-24 space-y-24">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <h1 className="text-6xl font-bold leading-tight tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Atypica LLM
          </h1>
          <p className="text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            发现独特的用户群体，洞察真实的市场需求
          </p>
        </div>

        {/* Features Section */}
        <div className="grid gap-8 md:gap-12 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          <Link href="/analyst">
            <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/0 group-hover:translate-x-full transition-transform duration-500" />
              <CardHeader className="p-8">
                <div className="flex items-start gap-6">
                  <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-2xl font-semibold text-primary-foreground shrink-0">
                    1
                  </span>
                  <div className="space-y-3">
                    <CardTitle className="text-2xl">开始用户访谈</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      让 AI
                      扮演专业分析师，通过深度访谈发现用户真实需求。突破传统调研局限，获得更深层的用户洞察。
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/personas">
            <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/0 group-hover:translate-x-full transition-transform duration-500" />
              <CardHeader className="p-8">
                <div className="flex items-start gap-6">
                  <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-2xl font-semibold text-primary-foreground shrink-0">
                    2
                  </span>
                  <div className="space-y-3">
                    <CardTitle className="text-2xl">查看用户画像</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      基于深度访谈数据，AI
                      自动构建立体用户画像。发现用户行为模式，预测潜在需求，为产品决策提供支持。
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/scout">
            <Card className="group relative overflow-hidden border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/0 group-hover:translate-x-full transition-transform duration-500" />
              <CardHeader className="p-8">
                <div className="flex items-start gap-6">
                  <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-2xl font-semibold text-primary-foreground shrink-0">
                    3
                  </span>
                  <div className="space-y-3">
                    <CardTitle className="text-2xl">发现新机会</CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      突破固有思维，探索新的市场机会。让 AI
                      帮助你发现新的用户群体，开拓新的市场空间。
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
