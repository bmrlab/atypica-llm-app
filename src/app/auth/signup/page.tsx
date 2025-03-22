"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError("");

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      // Sign in automatically after successful registration
      await signIn("credentials", {
        email,
        password,
        callbackUrl: "/",
      });
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
          <h1 className="text-3xl font-bold">注册</h1>
          <p className="text-gray-500">创建您的账户</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-500">{error}</div>}
          <div className="space-y-2">
            <Input
              id="email"
              placeholder="您的 @tezign.com 邮箱地址"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              id="password"
              placeholder="设置密码"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? "注册中..." : "注册"}
          </Button>
        </form>
        <div className="text-center text-sm">
          已有账号？{" "}
          <Link href="/auth/signin" className="text-blue-500 hover:underline">
            立即登录
          </Link>
        </div>
      </div>
    </div>
  );
}
