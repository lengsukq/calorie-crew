"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

interface TabItem {
  id: string;
  label: string;
  icon: string;
  href: "/today" | "/diary" | "/progress" | "/profile";
}

const TABS: TabItem[] = [
  { id: "today", label: "今日", icon: "📊", href: "/today" },
  { id: "diary", label: "日记", icon: "📝", href: "/diary" },
  { id: "progress", label: "进度", icon: "📈", href: "/progress" },
  { id: "profile", label: "我的", icon: "👤", href: "/profile" },
];

export function TabBar() {
  const segment = useSelectedLayoutSegment();
  const currentTab = segment ?? "today";

  return (
    <>
      {/* Mobile bottom tab bar */}
      <nav className="tab-bar-mobile">
        <div className="mx-auto flex h-full max-w-lg items-center justify-around px-4">
          {TABS.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`tab-item ${isActive ? "tab-item-active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar */}
      <aside className="tab-bar-sidebar">
        <div className="flex flex-col items-center gap-2 py-6 lg:items-start lg:px-4">
          {TABS.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`sidebar-item ${isActive ? "sidebar-item-active" : ""}`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="sidebar-icon">{tab.icon}</span>
                <span className="sidebar-label">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}
