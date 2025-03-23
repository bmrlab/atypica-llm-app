"use client";
import { Button } from "@/components/ui/button";
import Cookies from "js-cookie";
import { GlobeIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LanguageToggle() {
  const router = useRouter();
  const [locale, setLocale] = useState<string>("zh-CN");

  useEffect(() => {
    // Read locale from cookie when component mounts
    const savedLocale = Cookies.get("locale") || "zh-CN";
    setLocale(savedLocale);
  }, []);

  const toggleLocale = () => {
    const newLocale = locale === "zh-CN" ? "en-US" : "zh-CN";
    // Save to cookie
    Cookies.set("locale", newLocale, { expires: 365 });
    setLocale(newLocale);
    // Refresh the page to apply changes
    router.refresh();
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggleLocale} title="Change Language">
      <GlobeIcon className="h-4 w-4 mr-1" />
      <span className="text-xs">{locale === "zh-CN" ? "English" : "中文"}</span>
    </Button>
  );
}
