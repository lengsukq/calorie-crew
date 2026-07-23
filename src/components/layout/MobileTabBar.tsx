"use client";

import Link from "next/link";
import { useRouter, useSelectedLayoutSegment } from "next/navigation";
import { Plus } from "lucide-react";
import { NAV_ITEMS_LEFT, NAV_ITEMS_RIGHT, type NavItem } from "@/components/layout/nav-items";
import { dispatchOpenRecord } from "@/hooks/useRecordTrigger";
import { cn } from "@/lib/utils";

function TabLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "flex flex-col items-center justify-center gap-1 py-1.5 text-[11px] font-medium transition-colors",
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon className="h-5 w-5" />
      <span>{item.label}</span>
    </Link>
  );
}

export function MobileTabBar() {
  const router = useRouter();
  const segment = useSelectedLayoutSegment();
  const currentTab = segment ?? "today";

  function handleRecordClick() {
    dispatchOpenRecord({
      onCurrentPage: currentTab === "today" || currentTab === "diary",
      navigate: (href) => router.push(href),
    });
  }

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-safe backdrop-blur lg:hidden"
      aria-label="主导航"
    >
      <div className="mx-auto grid h-16 max-w-lg grid-cols-5 items-center px-2">
        {NAV_ITEMS_LEFT.map((item) => (
          <TabLink key={item.id} item={item} isActive={currentTab === item.id} />
        ))}

        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={handleRecordClick}
            aria-label="添加饮食记录"
            className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25 transition-transform active:scale-95"
          >
            <Plus className="h-6 w-6" />
          </button>
        </div>

        {NAV_ITEMS_RIGHT.map((item) => (
          <TabLink key={item.id} item={item} isActive={currentTab === item.id} />
        ))}
      </div>
    </nav>
  );
}
