import * as React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  progress?: { current: number; max: number };
  accentColor?: string;
  className?: string;
}

const ACCENT_TEXT: Record<string, string> = {
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  purple: "text-chart-4",
};

const ACCENT_BG: Record<string, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  purple: "bg-chart-4",
};

/**
 * 统一统计卡片：合并原 MiniStatCard / StatBox。
 * 极简风格，无 emoji，用彩色强调数值。
 */
export function StatCard({
  label,
  value,
  unit,
  trend,
  trendLabel,
  progress,
  accentColor,
  className,
}: StatCardProps) {
  const progressPercent = progress
    ? Math.min((progress.current / progress.max) * 100, 100)
    : 0;

  const trendColor =
    trend === "up" ? "text-success" : trend === "down" ? "text-danger" : "text-muted-foreground";

  return (
    <div className={cn("rounded-lg border bg-card p-3 text-center", className)}>
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-xl font-bold tabular-nums", accentColor && ACCENT_TEXT[accentColor])}>
        {value}
        {unit && <span className="ml-0.5 text-xs font-normal text-muted-foreground">{unit}</span>}
      </p>
      {trendLabel && (
        <p className={cn("mt-0.5 text-[11px] font-medium", trendColor)}>{trendLabel}</p>
      )}
      {progress && (
        <div className="mt-2">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-500 ease-out",
                accentColor ? ACCENT_BG[accentColor] : "bg-primary",
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground tabular-nums">
            {progress.current} / {progress.max}
          </p>
        </div>
      )}
    </div>
  );
}
