"use client";

import { useId } from "react";

interface CalorieRingProps {
  current: number;
  target: number;
  /** 环形图直径（px），默认 200 */
  size?: number;
}

export function CalorieRing({ current, target, size = 200 }: CalorieRingProps) {
  const gradientId = `ring-gradient-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2 - 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const safeTarget = target > 0 ? target : 1;
  const ratio = Math.min(current / safeTarget, 1);
  const offset = circumference * (1 - ratio);
  const remaining = Math.max(target - current, 0);
  const isOver = current > target;

  return (
    <div className="relative mx-auto w-fit">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            {isOver ? (
              <>
                <stop offset="0%" stopColor="hsl(var(--ring-over-start))" />
                <stop offset="100%" stopColor="hsl(var(--ring-over-end))" />
              </>
            ) : (
              <>
                <stop offset="0%" stopColor="hsl(var(--ring-start))" />
                <stop offset="100%" stopColor="hsl(var(--ring-end))" />
              </>
            )}
          </linearGradient>
        </defs>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-muted"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke={`url(#${gradientId})`}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease-in-out" }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black tabular-nums text-foreground">{current}</span>
        <span className="text-[11px] text-muted-foreground/70 tabular-nums">/ {target} kcal</span>
      </div>

      <div
        className={`absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
          isOver
            ? "bg-destructive/10 text-destructive"
            : "bg-muted text-muted-foreground"
        }`}
      >
        {isOver ? `超出 ${current - target}` : `剩余 ${remaining}`} kcal
      </div>
    </div>
  );
}
