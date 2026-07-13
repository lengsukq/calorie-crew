"use client";

import { useProfile } from "@/hooks/useProfile";

const BMI_COLOR_CLASSES = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  orange: "bg-orange-50 text-orange-600",
  red: "bg-red-50 text-red-600",
} as const;

export function HealthMetricsCard() {
  const { data, loading, error, reload } = useProfile();
  const metrics = data?.metrics ?? null;

  return (
    <div className="glass-card">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">💗</span>
          <span className="text-sm font-semibold text-slate-700">健康指标</span>
        </div>
        <button type="button" onClick={() => void reload()} className="text-xs text-cyan-500 hover:text-cyan-600">
          刷新
        </button>
      </div>

      {loading && <div className="y2k-spinner h-5 w-5" />}
      {error && <p role="alert" className="mb-3 text-xs text-red-500">{error}</p>}

      {!loading && metrics && metrics.bmi !== null ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MetricBox label="BMI" value={metrics.bmi.toFixed(1)} badge={metrics.bmiCategory} color={metrics.bmiCategoryColor} />
          <MetricBox label="BMR" value={String(metrics.bmr)} unit="kcal" />
          <MetricBox label="TDEE" value={String(metrics.tdee)} unit="kcal" />
          <MetricBox
            label="建议摄入"
            value={metrics.suggestedIntake ? `${metrics.suggestedIntake.min}-${metrics.suggestedIntake.max}` : "--"}
            unit="kcal"
          />
        </div>
      ) : (
        !loading && (
          <div className="rounded-2xl bg-white/50 px-4 py-5 text-center text-sm text-slate-400">
            请完善出生日期、身高，并记录一次体重以查看 BMI、BMR 与 TDEE。
          </div>
        )
      )}
    </div>
  );
}

interface MetricBoxProps {
  label: string;
  value: string;
  unit?: string;
  badge?: string | null;
  color?: keyof typeof BMI_COLOR_CLASSES | null;
}

function MetricBox({
  label,
  value,
  unit,
  badge,
  color,
}: MetricBoxProps) {
  return (
    <div className="rounded-2xl bg-white/55 px-3 py-4 text-center">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-black text-slate-800">
        {value}
        {unit && <span className="ml-1 text-xs font-normal text-slate-400">{unit}</span>}
      </p>
      {badge && color && (
        <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${BMI_COLOR_CLASSES[color]}`}>
          {badge}
        </span>
      )}
    </div>
  );
}
