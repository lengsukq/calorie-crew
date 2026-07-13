"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

interface TabItem {
  id: string;
  label: string;
  href: "/today" | "/diary" | "/progress" | "/profile";
  icon: React.ReactNode;
}

const ACTIVE_CLASSES =
  "text-cyan-600 [&_.tab-icon-svg]:text-cyan-500 [&_.tab-label-text]:font-semibold";
const INACTIVE_CLASSES =
  "text-slate-400 hover:text-slate-600 [&_.tab-icon-svg]:text-slate-400 hover:[&_.tab-icon-svg]:text-slate-500";

const TABS: TabItem[] = [
  {
    id: "today",
    label: "今日",
    href: "/today",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="tab-icon-svg"
      >
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    id: "diary",
    label: "日记",
    href: "/diary",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="tab-icon-svg"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    id: "progress",
    label: "进度",
    href: "/progress",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="tab-icon-svg"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    id: "profile",
    label: "我的",
    href: "/profile",
    icon: (
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="tab-icon-svg"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
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
                className={`tab-item ${isActive ? "tab-item-active" : ""} ${isActive ? ACTIVE_CLASSES : INACTIVE_CLASSES}`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span className="tab-label tab-label-text">{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar */}
      <aside className="tab-bar-sidebar">
        <div className="flex h-full flex-col">
          {/* Sidebar header */}
          <div className="flex items-center gap-3 px-5 py-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg">
              <span className="text-lg font-bold text-white">C</span>
            </div>
            <div className="hidden lg:block">
              <p className="text-sm font-bold text-slate-800">CalorieCrew</p>
              <p className="text-[10px] text-slate-400">饮食记录助手</p>
            </div>
          </div>

          {/* Navigation items */}
          <div className="flex flex-col gap-1 px-3">
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

          {/* Spacer */}
          <div className="flex-1" />

          {/* Sidebar footer with daily target summary */}
          <div className="sidebar-footer">
            <SidebarProgress
              current={0}
              target={2000}
              label="今日热量"
            />
          </div>
        </div>
      </aside>
    </>
  );
}

function SidebarProgress({
  current,
  target,
  label,
}: {
  current: number;
  target: number;
  label: string;
}) {
  const ratio = Math.min(current / target, 1);
  const remaining = Math.max(target - current, 0);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-500">{label}</span>
        <span className="font-semibold text-slate-600">
          {current} / {target}
        </span>
      </div>
      <div className="sidebar-progress-track">
        <div
          className="sidebar-progress-fill"
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
      <p className="text-[10px] text-slate-400">
        剩余 {remaining} kcal
      </p>
    </div>
  );
}
