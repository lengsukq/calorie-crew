"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";
import { NAV_ITEMS } from "@/components/layout/nav-items";
import { cn } from "@/lib/utils";

export function MobileTabBar() {
  const segment = useSelectedLayoutSegment();
  const currentTab = segment ?? "today";

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 h-16 border-t bg-background/95 backdrop-blur pb-safe lg:hidden"
      aria-label="主导航"
    >
      <div className="mx-auto flex h-full max-w-lg items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = currentTab === item.id;
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-1 py-1.5 text-[11px] font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
