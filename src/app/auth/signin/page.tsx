"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError("");

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result?.error) {
        router.replace(callbackUrl);
      } else {
        setError("Invalid email or password");
      }
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto w-full max-w-xs space-y-6 px-4">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">登录</h1>
          <p className="text-gray-500">请输入您的登录信息</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-500">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Input
              id="email"
              placeholder="您的邮箱地址"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              id="password"
              placeholder="您的密码"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? "登录中..." : "登录"}
          </Button>
        </form>
        <div className="text-center text-sm">
          还没有账号？{" "}
          <Link href="/auth/signup" className="text-blue-500 hover:underline">
            立即注册
          </Link>
        </div>
      </div>
    </div>
  );
}
