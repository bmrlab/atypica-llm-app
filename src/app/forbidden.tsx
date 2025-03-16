import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ShieldXIcon } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <div className="max-w-md mx-auto px-4 py-8 text-center">
        <div className="inline-block animate-pulse rounded-full bg-destructive/10 p-6 mb-6">
          <ShieldXIcon className="size-12 text-destructive" />
        </div>

        <h1 className="text-4xl font-medium tracking-tight mb-4 bg-gradient-to-r from-destructive/80 to-destructive bg-clip-text text-transparent">
          访问被拒绝
        </h1>

        <p className="text-muted-foreground mb-8">
          很抱歉，您没有访问此页面的权限。请确认您的访问权限或联系管理员。
        </p>

        <div className="space-y-4">
          <Button variant="outline" asChild>
            <Link href="/" className="inline-flex items-center">
              返回首页
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
