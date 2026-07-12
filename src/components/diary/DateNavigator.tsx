"use client";

interface DateNavigatorProps {
  date: string;
  onChange: (date: string) => void;
}

function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const ymd = (d: Date) => d.toISOString().slice(0, 10);

  if (dateStr === ymd(today)) return "今天";
  if (dateStr === ymd(yesterday)) return "昨天";
  if (dateStr === ymd(tomorrow)) return "明天";

  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function toISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function DateNavigator({ date, onChange }: DateNavigatorProps) {
  const current = new Date(date + "T00:00:00");
  const today = new Date();

  const goBack = () => {
    const prev = new Date(current);
    prev.setDate(prev.getDate() - 1);
    onChange(toISO(prev));
  };

  const goForward = () => {
    const next = new Date(current);
    next.setDate(next.getDate() + 1);
    onChange(toISO(next));
  };

  const goToday = () => {
    onChange(toISO(today));
  };

  const isToday = date === toISO(today);

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
