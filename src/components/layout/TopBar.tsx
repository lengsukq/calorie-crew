"use client";

import { useSelectedLayoutSegment } from "next/navigation";
import { NotificationBell } from "@/components/notifications/NotificationBell";

const TAB_TITLES: Record<string, string> = {
  today: "今日",
  diary: "饮食日记",
  progress: "进度",
  profile: "我的",
};

export function TopBar() {
  const segment = useSelectedLayoutSegment();
  const title = TAB_TITLES[segment ?? "today"] ?? "CalorieCrew";

  return (
    <header className="top-bar">
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-4">
        <h1 className="text-lg font-bold text-slate-800">{title}</h1>
        <div className="flex items-center gap-3">
          <NotificationBell />
        </div>
      </div>
    </header>
  );
}
