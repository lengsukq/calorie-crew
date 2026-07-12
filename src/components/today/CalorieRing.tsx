"use client";

interface CalorieRingProps {
  current: number;
  target: number;
}

export function CalorieRing({ current, target }: CalorieRingProps) {
  const radius = 72;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.min(current / target, 1);
  const offset = circumference * (1 - ratio);
  const remaining = Math.max(target - current, 0);

  return (
    <div className="calorie-ring mx-auto w-fit">
      <svg width="200" height="200" viewBox="0 0 200 200">
        {/* Background ring */}
        <circle
          className="calorie-ring-bg"
          cx="100"
          cy="100"
          r={radius}
          strokeWidth="16"
        />
        {/* Progress ring */}
        <circle
          className="calorie-ring-fill"
          cx="100"
          cy="100"
          r={radius}
          strokeWidth="16"
          stroke="url(#calorieGradient)"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0891b2" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-slate-800">{current}</span>
        <span className="text-xs text-slate-400">/ {target} kcal</span>
      </div>

      {/* Remaining badge */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/80 px-4 py-1.5 text-xs font-semibold text-slate-500 shadow-sm backdrop-blur-sm">
        剩余 {remaining} kcal
      </div>
    </div>
  );
}
