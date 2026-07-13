"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

interface SidebarProps {
  email?: string;
}

export function Sidebar({ email }: SidebarProps) {
  const segment = useSelectedLayoutSegment();
  const currentTab = segment ?? "today";

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r bg-background lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <span className="text-base font-bold">C</span>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">CalorieCrew</p>
          <p className="text-[11px] text-muted-foreground">饮食记录助手</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-3" aria-label="主导航">
        {NAV_ITEMS.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer: user email */}
      {email && (
        <div className="border-t p-4">
          <p className="truncate text-xs text-muted-foreground">{email}</p>
        </div>
      )}
    </aside>
  );
}
