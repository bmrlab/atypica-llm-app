"use client";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";

function LoginOrLogout() {
  const { data: session } = useSession();

  if (!session) {
    return (
      <Button variant="ghost" size="sm" asChild>
        <Link href="/auth/signin">登录</Link>
      </Button>
    );
  }

  const userInitial =
    session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar className="size-8 cursor-pointer">
          <AvatarImage src={session.user?.image || ""} />
          <AvatarFallback>{userInitial}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })}>
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function UserMenu() {
  return (
    <div className="fixed right-0 top-0 h-screen sm:mx-2 2xl:mx-6 mt-2 2xl:mt-6 hidden sm:block">
      <LoginOrLogout />
    </div>
  );
}
