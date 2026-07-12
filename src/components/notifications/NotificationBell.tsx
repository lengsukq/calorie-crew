"use client";

import { useState } from "react";
import { NotificationPanel } from "@/components/notifications/NotificationPanel";

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="notification-bell"
        aria-label="通知"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-slate-500"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {hasUnread && <span className="notification-dot" />}
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <NotificationPanel onClose={() => setIsOpen(false)} />
        </>
      )}
    </div>
  );
}
