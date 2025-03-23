"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import Link from "next/link";

export default function UserMenu() {
  const { data: session } = useSession();
  const t = useTranslations("Components.UserMenu");

  if (!session) {
    return (
      <Button variant="ghost" size="sm" asChild>
        <Link href="/auth/signin">{t("login")}</Link>
      </Button>
    );
  }

  const userEmail = session.user?.email || "";
  const userInitial = session.user?.email?.charAt(0) || "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="size-8 cursor-pointer">
          <AvatarImage src={""} />
          <AvatarFallback>{userInitial}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>{userEmail}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>{t("logout")}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
