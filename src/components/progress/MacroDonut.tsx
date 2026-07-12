"use client";

interface MacroDonutProps {
  proteinG: number;
  carbsG: number;
  fatG: number;
}

const COLORS = {
  protein: "#a855f7",
  carbs: "#f59e0b",
  fat: "#10b981",
};

export function MacroDonut({ proteinG, carbsG, fatG }: MacroDonutProps) {
  const total = proteinG + carbsG + fatG;
  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-6">
        <p className="text-sm text-slate-400">暂无营养素数据</p>
      </div>
    );
  }

  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  const proteinRatio = proteinG / total;
  const carbsRatio = carbsG / total;
  const fatRatio = fatG / total;

  const proteinOffset = 0;
  const carbsOffset = proteinRatio * circumference;
  const fatOffset = (proteinRatio + carbsRatio) * circumference;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6">
      {/* Donut */}
      <div className="macro-donut">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="20" />
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke={COLORS.protein}
            strokeWidth="20"
            strokeDasharray={`${proteinRatio * circumference} ${circumference}`}
            strokeDashoffset={-proteinOffset}
            transform="rotate(-90, 80, 80)"
            strokeLinecap="butt"
          />
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke={COLORS.carbs}
            strokeWidth="20"
            strokeDasharray={`${carbsRatio * circumference} ${circumference}`}
            strokeDashoffset={-carbsOffset}
            transform="rotate(-90, 80, 80)"
            strokeLinecap="butt"
          />
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke={COLORS.fat}
            strokeWidth="20"
            strokeDasharray={`${fatRatio * circumference} ${circumference}`}
            strokeDashoffset={-fatOffset}
            transform="rotate(-90, 80, 80)"
            strokeLinecap="butt"
          />
          <text x="80" y="80" textAnchor="middle" dominantBaseline="middle" fontSize="24" fontWeight="800" fill="#1e293b">
            {total.toFixed(0)}
          </text>
          <text x="80" y="96" textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="#94a3b8">
            克
          </text>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2">
        <LegendItem color={COLORS.protein} label="蛋白质" value={proteinG.toFixed(1)} ratio={(proteinRatio * 100).toFixed(0)} />
        <LegendItem color={COLORS.carbs} label="碳水" value={carbsG.toFixed(1)} ratio={(carbsRatio * 100).toFixed(0)} />
        <LegendItem color={COLORS.fat} label="脂肪" value={fatG.toFixed(1)} ratio={(fatRatio * 100).toFixed(0)} />
      </div>
    </div>
  );
}

function LegendItem({
  color,
  label,
  value,
  ratio,
}: {
  color: string;
  label: string;
  value: string;
  ratio: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
      <span className="w-12 text-xs text-slate-500">{label}</span>
      <span className="w-16 text-right text-sm font-semibold text-slate-700">{value}g</span>
      <span className="w-10 text-right text-xs text-slate-400">{ratio}%</span>
    </div>
  );
}
