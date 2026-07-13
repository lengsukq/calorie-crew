"use client";

import { addDays, formatDisplayDate, todayDate } from "@/lib/date";

interface DateNavigatorProps {
  date: string;
  onChange: (date: string) => void;
}

export function DateNavigator({ date, onChange }: DateNavigatorProps) {
  const today = todayDate();

  const goBack = () => {
    onChange(addDays(date, -1));
  };

  const goForward = () => {
    onChange(addDays(date, 1));
  };

  const goToday = () => {
    onChange(today);
  };

  const isToday = date === today;

  return (
    <div className="glass-card !p-3">
      <div className="flex items-center justify-between">
        <button
          onClick={goBack}
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/50 hover:text-slate-600"
          aria-label="前一天"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-slate-700">
            {formatDisplayDate(date)}
          </span>
          {!isToday && (
            <button
              onClick={goToday}
              className="rounded-lg bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-600 transition-colors hover:bg-cyan-100"
            >
              回到今天
            </button>
          )}
        </div>

        <button
          onClick={goForward}
          disabled={isToday}
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-white/50 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="后一天"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
