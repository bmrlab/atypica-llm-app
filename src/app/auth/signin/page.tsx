"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

export default function SignInPage() {
  return (
    <Suspense>
      <SignIn />
    </Suspense>
  );
}

function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("Auth.SignIn");
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
        if (result.error === "EMAIL_NOT_VERIFIED") {
          setError(result.error);
          router.push("/auth/verify?email=" + email);
        } else {
          setError(t("errorMessage"));
        }
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
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-gray-500">{t("subtitle")}</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-500">{error}</div>}
          <div className="space-y-2">
            <Input
              id="email"
              placeholder={t("emailPlaceholder")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Input
              id="password"
              placeholder={t("passwordPlaceholder")}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button variant="outline" className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? t("submittingButton") : t("submitButton")}
          </Button>
        </form>
        <div className="text-center text-sm">
          {t("noAccountText")}{" "}
          <Link href="/auth/signup" className="text-blue-500 hover:underline">
            {t("signUpLink")}
          </Link>
        </div>
      </div>
    </div>
  );
}
