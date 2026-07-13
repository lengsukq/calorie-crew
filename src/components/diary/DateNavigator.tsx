"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { addDays, formatDisplayDate, todayDate } from "@/lib/date";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface DateNavigatorProps {
  date: string;
  onChange: (date: string) => void;
}

export function DateNavigator({ date, onChange }: DateNavigatorProps) {
  const today = todayDate();
  const isToday = date === today;

  return (
    <Card className="px-4 py-3">
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
            {formatDisplayDate(date)}
          </span>
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
