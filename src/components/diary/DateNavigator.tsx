"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, parseLocalDate, todayDate } from "@/lib/date";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DateNavigatorProps {
  date: string;
  onChange: (date: string) => void;
}

const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

function getRelativeLabel(date: string, today: string): string | null {
  if (date === today) return "今天";
  if (date === addDays(today, -1)) return "昨天";
  if (date === addDays(today, 1)) return "明天";
  return null;
}

function formatDateLabel(date: string): string {
  const parsed = parseLocalDate(date);
  if (!parsed) return date;
  return `${parsed.getMonth() + 1}月${parsed.getDate()}日 ${WEEKDAYS[parsed.getDay()]}`;
}

export function DateNavigator({ date, onChange }: DateNavigatorProps) {
  const today = todayDate();
  const isToday = date === today;
  const relativeLabel = getRelativeLabel(date, today);
  const touchStartX = useRef<number | null>(null);

  function handleTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0].clientX;
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const deltaX = event.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;

    const SWIPE_THRESHOLD = 48;
    if (deltaX > SWIPE_THRESHOLD) {
      // 右滑 → 前一天
      onChange(addDays(date, -1));
    } else if (deltaX < -SWIPE_THRESHOLD) {
      // 左滑 → 后一天（不超过今天）
      if (!isToday) onChange(addDays(date, 1));
    }
  }

  return (
    <Card
      className="px-4 py-3 select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => onChange(addDays(date, -1))}
          aria-label="前一天"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-foreground tabular-nums">
            {formatDateLabel(date)}
          </span>
          {relativeLabel && (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                isToday ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
              )}
            >
              {relativeLabel}
            </span>
          )}
          {!isToday && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onChange(today)}
            >
              回到今天
            </Button>
          )}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => onChange(addDays(date, 1))}
          disabled={isToday}
          aria-label="后一天"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </Card>
  );
}
