"use client";

import { useState } from "react";
import { useHistory } from "@/hooks/useHistory";
import { CalorieChart } from "@/components/progress/CalorieChart";
import { MacroDonut } from "@/components/progress/MacroDonut";
import type { HistoryDay } from "@/shared/types";

type Period = 7 | 30;

export function ProgressContent() {
  const [period, setPeriod] = useState<Period>(7);
  const { data, loading } = useHistory(period);

  const sortedData = [...data].sort((a, b) => a.logDate.localeCompare(b.logDate));

  const avgKcal =
    data.length > 0
      ? Math.round(data.reduce((s, d) => s + d.totalKcal, 0) / data.length)
      : 0;

  const avgProtein =
    data.length > 0
      ? (data.reduce((s, d) => s + parseFloat(d.totalProteinG || "0"), 0) / data.length).toFixed(1)
      : "0";

  const onTargetDays = data.filter((d) => d.totalKcal <= d.targetKcal).length;

  const totalProtein = data.reduce((s, d) => s + parseFloat(d.totalProteinG || "0"), 0);
  const totalCarbs = data.reduce((s, d) => s + parseFloat(d.totalCarbsG || "0"), 0);
  const totalFat = data.reduce((s, d) => s + parseFloat(d.totalFatG || "0"), 0);

  return (
    <div className="stack page-enter">
      {/* Period toggle */}
      <div className="flex gap-2">
        <PeriodButton
          active={period === 7}
          onClick={() => setPeriod(7)}
          label="本周"
        />
        <PeriodButton
          active={period === 30}
          onClick={() => setPeriod(30)}
          label="本月"
        />
      </div>

      {/* Calorie trend chart */}
      <div className="glass-card">
        <h2 className="mb-4 text-slate-800">热量趋势</h2>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="y2k-spinner h-6 w-6" />
          </div>
        ) : data.length === 0 ? (
          <EmptyState icon="📈" text="暂无足够数据，多记录几天再来看看吧" />
        ) : (
          <CalorieChart data={sortedData} />
        )}
      </div>

      {/* Macro distribution */}
      <div className="glass-card">
        <h2 className="mb-4 text-slate-800">营养素分布</h2>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="y2k-spinner h-6 w-6" />
          </div>
        ) : data.length === 0 ? (
          <EmptyState icon="🥗" text="暂无营养素数据" />
        ) : (
          <MacroDonut proteinG={totalProtein} carbsG={totalCarbs} fatG={totalFat} />
        )}
      </div>

      {/* Stats summary */}
      <div className="glass-card">
        <h2 className="mb-4 text-slate-800">数据摘要</h2>
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="日均热量" value={`${avgKcal}`} unit="kcal" />
          <StatBox label="日均蛋白质" value={avgProtein} unit="g" />
          <StatBox label="达标天数" value={`${onTargetDays}`} unit={`/ ${data.length}`} />
        </div>
      </div>
    </div>
  );
}

function PeriodButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-5 py-2 text-sm font-semibold transition-all ${
        active
          ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-md"
          : "bg-white/50 text-slate-500 hover:bg-white/80"
      }`}
    >
      {label}
    </button>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 py-8">
      <span className="text-3xl opacity-50">{icon}</span>
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  );
}

function StatBox({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit: string;
}) {
  return (
    <div className="rounded-xl bg-white/50 px-3 py-4 text-center backdrop-blur-sm">
      <p className="text-xl font-bold text-slate-800">
        {value}
        <span className="ml-0.5 text-xs font-normal text-slate-400">{unit}</span>
      </p>
      <p className="mt-1 text-[10px] font-medium text-slate-400">{label}</p>
    </div>
  );
}
