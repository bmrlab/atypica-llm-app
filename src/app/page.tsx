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
          <p className="text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-6 duration-1000">
            发现独特的用户群体，洞察真实的市场需求
          </p>
        </div>

        {/* Features Section */}
        <div className="grid gap-8 md:gap-12 max-w-4xl mx-auto">
          <Link
            href="/analyst"
            className="animate-in fade-in slide-in-from-bottom-8 duration-1000"
          >
            <div className="group relative overflow-hidden border-2 rounded-lg hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-white dark:bg-black">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/0 group-hover:translate-x-full transition-transform duration-500" />
              <div className="p-8">
                <div className="flex items-start gap-6">
                  <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-2xl font-semibold text-primary-foreground shrink-0">
                    1
                  </span>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-semibold">开始用户访谈</h3>
                    <p className="text-base leading-relaxed text-muted-foreground">
                      让 AI
                      扮演专业分析师，通过深度访谈发现用户真实需求。突破传统调研局限，获得更深层的用户洞察。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          <Link
            href="/personas"
            className="animate-in fade-in slide-in-from-bottom-10 duration-1000"
          >
            <div className="group relative overflow-hidden border-2 rounded-lg hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-white dark:bg-black">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/0 group-hover:translate-x-full transition-transform duration-500" />
              <div className="p-8">
                <div className="flex items-start gap-6">
                  <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-2xl font-semibold text-primary-foreground shrink-0">
                    2
                  </span>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-semibold">查看用户画像</h3>
                    <p className="text-base leading-relaxed text-muted-foreground">
                      基于深度访谈数据，AI
                      自动构建立体用户画像。发现用户行为模式，预测潜在需求，为产品决策提供支持。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          <Link
            href="/scout"
            className="animate-in fade-in slide-in-from-bottom-12 duration-1000"
          >
            <div className="group relative overflow-hidden border-2 rounded-lg hover:border-primary/50 transition-all duration-300 hover:shadow-lg bg-white dark:bg-black">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/0 group-hover:translate-x-full transition-transform duration-500" />
              <div className="p-8">
                <div className="flex items-start gap-6">
                  <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-primary text-2xl font-semibold text-primary-foreground shrink-0">
                    3
                  </span>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-semibold">发现新机会</h3>
                    <p className="text-base leading-relaxed text-muted-foreground">
                      突破固有思维，探索新的市场机会。让 AI
                      帮助你发现新的用户群体，开拓新的市场空间。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
