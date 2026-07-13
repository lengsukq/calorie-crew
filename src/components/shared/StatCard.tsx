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

const ACCENT_COLORS: Record<string, string> = {
  primary: "text-primary",
  success: "text-emerald-600",
  warning: "text-amber-600",
  danger: "text-red-600",
  purple: "text-purple-600",
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
    trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-600" : "text-muted-foreground";

  return (
    <div className={cn("rounded-lg border bg-card p-3 text-center", className)}>
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className={cn("mt-1 text-xl font-bold tabular-nums", accentColor && ACCENT_COLORS[accentColor])}>
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
              className={cn("h-full rounded-full", accentColor ? ACCENT_COLORS[accentColor] : "bg-primary")}
              style={{ width: `${progressPercent}%`, backgroundColor: accentColor ? undefined : undefined }}
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
