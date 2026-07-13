"use client";

interface CalorieRingProps {
  current: number;
  target: number;
}

export function CalorieRing({ current, target }: CalorieRingProps) {
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const safeTarget = target > 0 ? target : 1;
  const ratio = Math.min(current / safeTarget, 1);
  const offset = circumference * (1 - ratio);
  const remaining = Math.max(target - current, 0);
  const isOver = current > target;

  return (
    <div className="relative mx-auto w-fit">
      <svg width="200" height="200" viewBox="0 0 200 200" className="-rotate-90">
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          strokeWidth="14"
          className="stroke-muted"
        />
        <circle
          cx="100"
          cy="100"
          r={radius}
          fill="none"
          strokeWidth="14"
          strokeLinecap="round"
          stroke={isOver ? "hsl(var(--destructive))" : "hsl(var(--primary))"}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease-in-out" }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums text-foreground">{current}</span>
        <span className="text-xs text-muted-foreground tabular-nums">/ {target} kcal</span>
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
