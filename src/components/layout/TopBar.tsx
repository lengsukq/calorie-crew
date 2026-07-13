"use client";

import { useSelectedLayoutSegment } from "next/navigation";

const TAB_TITLES: Record<string, string> = {
  today: "今日",
  diary: "饮食日记",
  progress: "进度",
  profile: "我的",
};

function formatDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const weekday = weekdays[now.getDay()];
  return `${year}年${month}月${day}日 ${weekday}`;
}

export function TopBar() {
  const segment = useSelectedLayoutSegment();
  const title = TAB_TITLES[segment ?? "today"] ?? "CalorieCrew";
  const isToday = segment === "today" || !segment;
  const dateString = formatDateString();

  return (
    <header className="top-bar">
      <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-slate-800">{title}</h1>
          {isToday && (
            <span className="hidden text-xs text-slate-400 sm:inline">
              {dateString}
            </span>
          )}
        </div>
        {isToday && (
          <span className="text-xs text-slate-400 sm:hidden">
            {dateString}
          </span>
        )}
      </div>
    </header>
  );
}
