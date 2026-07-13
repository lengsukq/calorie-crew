"use client";

import { useRouter } from "next/navigation";
import { useSelectedLayoutSegment } from "next/navigation";
import { LogOut, User as UserIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TAB_TITLES } from "@/components/layout/nav-items";
import { logout } from "@/lib/api/auth";

interface TopBarProps {
  email?: string;
  role?: string;
}

export function TopBar({ email, role }: TopBarProps) {
  const segment = useSelectedLayoutSegment();
  const title = TAB_TITLES[segment ?? "today"] ?? "CalorieCrew";
  const router = useRouter();

  async function handleLogout() {
    try {
      await logout();
    } finally {
      router.push("/login");
    }
  }

  const initial = email ? email.charAt(0).toUpperCase() : "?";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur lg:px-8">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>

      {email && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              aria-label="用户菜单"
            >
              {initial}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{email}</p>
                {role && (
                  <p className="text-xs text-muted-foreground">
                    {role === "admin" ? "管理员" : "会员"}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/profile")}>
              <UserIcon className="h-4 w-4" />
              <span>个人资料</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" />
              <span>退出登录</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}
