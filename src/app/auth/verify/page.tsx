"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("Auth.Verify");
  const email = searchParams.get("email") || "";
  const [verificationCode, setVerificationCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      const res = await fetch("/api/auth/verify", {
        method: "POST",
        body: JSON.stringify({
          email,
          code: verificationCode,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      const data = await res.json();

      if (data.message === "Email already verified") {
        setSuccess(t("alreadyVerifiedMessage"));
      } else {
        setSuccess(t("successMessage"));
      }

      setTimeout(() => {
        router.push("/auth/signin");
      }, 2000);
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Something went wrong");
      }

      setSuccess("Verification code resent. Please check your email.");
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
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="text-gray-500">{t("description", { email })}</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          {error && <div className="rounded-lg bg-red-50 p-4 text-sm text-red-500">{error}</div>}
          {success && (
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-500">{success}</div>
          )}
          <div className="space-y-2">
            <Input
              id="verificationCode"
              placeholder={t("codePlaceholder")}
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
            />
          </div>
          <Button variant="outline" className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? t("submittingButton") : t("submitButton")}
          </Button>
        </form>
        <div className="text-center text-sm">
          {t("noCodeText")}{" "}
          <button
            className="text-blue-500 hover:underline"
            onClick={handleResendCode}
            disabled={isLoading}
          >
            {t("resendButton")}
          </button>
        </div>
      </div>
    </div>
  );
}
