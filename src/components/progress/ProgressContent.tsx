"use client";

import { useMemo, useState } from "react";
import { useBodyMeasurements } from "@/hooks/useBodyMeasurements";
import { useExerciseLogs } from "@/hooks/useExerciseLogs";
import { useHistory } from "@/hooks/useHistory";
import { useSleepLogs } from "@/hooks/useSleepLogs";
import { useWeightLogs } from "@/hooks/useWeightLogs";
import { CalorieChart } from "@/components/progress/CalorieChart";
import { ExerciseStatsPanel } from "@/components/progress/ExerciseStatsPanel";
import { MacroDonut } from "@/components/progress/MacroDonut";
import { WeightTrendChart } from "@/components/progress/WeightTrendChart";
import { MiniStatCard } from "@/components/shared/MiniStatCard";
import { AiAdviceCard } from "@/components/shared/AiAdviceCard";
import { addDays, todayDate } from "@/lib/date";
import type { HistoryDay } from "@/shared/types";

type Period = 7 | 30 | 365;

interface ProgressContentProps {
  weightTargetKg: string | null;
}

/**
 * Calculate the longest streak of consecutive days with data.
 * A "streak day" = there is a log entry for that day.
 */
function calculateStreak(data: HistoryDay[]): number {
  if (data.length === 0) return 0;

  const sorted = [...data].sort((a, b) => a.logDate.localeCompare(b.logDate));

  // Find longest consecutive run
  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].logDate + "T00:00:00");
    const curr = new Date(sorted[i].logDate + "T00:00:00");
    const diffDays = Math.round(
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 1) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else if (diffDays > 1) {
      currentStreak = 1;
    }
  }

  return maxStreak;
}

/**
 * Calculate on-target rate: percentage of days where totalKcal <= targetKcal
 */
function calculateOnTargetRate(data: HistoryDay[]): string {
  if (data.length === 0) return "0";
  const onTarget = data.filter((d) => d.totalKcal <= d.targetKcal).length;
  return ((onTarget / data.length) * 100).toFixed(0);
}

/**
 * Compare last N days with the N days before them (week-over-week).
 */
function calculateWeekComparison(data: HistoryDay[]): {
  currentAvg: number;
  previousAvg: number;
  diff: number;
} | null {
  if (data.length < 14) return null;

  const sorted = [...data].sort((a, b) => a.logDate.localeCompare(b.logDate));
  const recent7 = sorted.slice(-7);
  const prev7 = sorted.slice(-14, -7);

  const currentAvg = Math.round(
    recent7.reduce((s, d) => s + d.totalKcal, 0) / recent7.length,
  );
  const previousAvg = Math.round(
    prev7.reduce((s, d) => s + d.totalKcal, 0) / prev7.length,
  );

  return {
    currentAvg,
    previousAvg,
    diff: currentAvg - previousAvg,
  };
}

function getPeriodStartDate(period: Period): string {
  return addDays(todayDate(), -period + 1);
}

export function ProgressContent({ weightTargetKg }: ProgressContentProps) {
  const [period, setPeriod] = useState<Period>(7);
  const { data, loading } = useHistory(period);
  const rangeStartDate = getPeriodStartDate(period);
  const rangeEndDate = todayDate();
  const { logs: weightLogs, loading: weightLoading } = useWeightLogs({
    startDate: rangeStartDate,
    endDate: rangeEndDate,
  });
  const { logs: exerciseLogs, loading: exerciseLoading } = useExerciseLogs({
    startDate: rangeStartDate,
    endDate: rangeEndDate,
  });
  const { logs: sleepLogs, loading: sleepLoading } = useSleepLogs({
    startDate: rangeStartDate,
    endDate: rangeEndDate,
  });
  const { logs: bodyMeasurementLogs, loading: bodyMeasurementLoading } = useBodyMeasurements({
    startDate: rangeStartDate,
    endDate: rangeEndDate,
  });

  const sortedData = useMemo(
    () => [...data].sort((a, b) => a.logDate.localeCompare(b.logDate)),
    [data],
  );

  const avgKcal =
    data.length > 0
      ? Math.round(data.reduce((s, d) => s + d.totalKcal, 0) / data.length)
      : 0;

  const avgProtein =
    data.length > 0
      ? (
          data.reduce((s, d) => s + parseFloat(d.totalProteinG || "0"), 0) /
          data.length
        ).toFixed(1)
      : "0";

  const onTargetDays = data.filter((d) => d.totalKcal <= d.targetKcal).length;
  const streak = useMemo(() => calculateStreak(data), [data]);
  const onTargetRate = useMemo(() => calculateOnTargetRate(data), [data]);
  const weekComparison = useMemo(() => calculateWeekComparison(data), [data]);

  const totalProtein = data.reduce(
    (s, d) => s + parseFloat(d.totalProteinG || "0"),
    0,
  );
  const totalCarbs = data.reduce(
    (s, d) => s + parseFloat(d.totalCarbsG || "0"),
    0,
  );
  const totalFat = data.reduce(
    (s, d) => s + parseFloat(d.totalFatG || "0"),
    0,
  );

  return (
    <div className="stack page-enter">
      {/* Period toggle */}
      <div className="flex gap-2">
        <PeriodButton
          active={period === 7}
          onClick={() => setPeriod(7)}
          label="近 7 天"
        />
        <PeriodButton
          active={period === 30}
          onClick={() => setPeriod(30)}
          label="近 30 天"
        />
        <PeriodButton
          active={period === 365}
          onClick={() => setPeriod(365)}
          label="全部"
        />
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MiniStatCard label="日均热量" value={avgKcal} unit="kcal" />
        <MiniStatCard label="日均蛋白质" value={avgProtein} unit="g" />
        <MiniStatCard label="达标率" value={`${onTargetRate}%`} />
        <MiniStatCard label="最长连续" value={streak} unit="天" />
      </div>

      <AiAdviceCard title="AI 健康周报" type="weekly_summary" icon="📊" autoGenerate />

      {/* Week-over-week comparison */}
      {weekComparison && (
        <div className="glass-card">
          <h2 className="mb-3 text-slate-800">热量对比</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-[10px] font-medium text-slate-400">上周日均</p>
              <p className="mt-1 text-xl font-bold text-slate-600">
                {weekComparison.previousAvg}
              </p>
              <p className="text-[10px] text-slate-400">kcal</p>
            </div>
            <div className="flex items-center justify-center">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                  weekComparison.diff <= 0
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-500"
                }`}
              >
                {weekComparison.diff <= 0 ? "↓" : "↑"}{" "}
                {Math.abs(weekComparison.diff)} kcal
              </span>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-medium text-slate-400">本周日均</p>
              <p className="mt-1 text-xl font-bold text-slate-800">
                {weekComparison.currentAvg}
              </p>
              <p className="text-[10px] text-slate-400">kcal</p>
            </div>
          </div>
        </div>
      )}

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

      <div className="glass-card">
        <h2 className="mb-4 text-slate-800">体重趋势</h2>
        {weightLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="y2k-spinner h-6 w-6" />
          </div>
        ) : weightLogs.length === 0 ? (
          <EmptyState icon="⚖️" text="暂无体重记录，先在今日页面记录一次吧" />
        ) : (
          <>
            <WeightTrendChart logs={weightLogs} weightTargetKg={weightTargetKg} />
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StatBox label="起始体重" value={Number(weightLogs[0].weightKg).toFixed(1)} unit="kg" />
              <StatBox
                label="当前体重"
                value={Number(weightLogs[weightLogs.length - 1].weightKg).toFixed(1)}
                unit="kg"
              />
              <StatBox
                label="变化"
                value={(Number(weightLogs[weightLogs.length - 1].weightKg) - Number(weightLogs[0].weightKg)).toFixed(1)}
                unit="kg"
              />
              <StatBox
                label="目标体重"
                value={weightTargetKg ? Number(weightTargetKg).toFixed(1) : "未设置"}
                unit={weightTargetKg ? "kg" : ""}
              />
            </div>
            {!weightTargetKg && (
              <p className="mt-3 text-center text-xs text-slate-400">可在个人资料中设置体重目标，趋势图会显示目标线。</p>
            )}
          </>
        )}
      </div>

      <div className="glass-card">
        <h2 className="mb-4 text-slate-800">运动统计</h2>
        {exerciseLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="y2k-spinner h-6 w-6" />
          </div>
        ) : (
          <ExerciseStatsPanel logs={exerciseLogs} />
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="glass-card">
          <h2 className="mb-3 text-slate-800">睡眠统计</h2>
          {sleepLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="y2k-spinner h-5 w-5" />
            </div>
          ) : sleepLogs.length === 0 ? (
            <EmptyState icon="😴" text="暂无睡眠记录" />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <StatBox
                label="平均时长"
                value={`${Math.round(sleepLogs.reduce((s, l) => s + l.sleepMinutes, 0) / sleepLogs.length / 60 * 10) / 10}`}
                unit="小时"
              />
              <StatBox
                label="平均质量"
                value={`${(sleepLogs.reduce((s, l) => s + l.quality, 0) / sleepLogs.length).toFixed(1)}`}
                unit="/ 5"
              />
            </div>
          )}
        </div>

        <div className="glass-card">
          <h2 className="mb-3 text-slate-800">身体数据</h2>
          {bodyMeasurementLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="y2k-spinner h-5 w-5" />
            </div>
          ) : bodyMeasurementLogs.length === 0 ? (
            <EmptyState icon="📏" text="暂无身体数据记录" />
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <StatBox
                label="最新腰围"
                value={bodyMeasurementLogs[0].waistCm ? Number(bodyMeasurementLogs[0].waistCm).toFixed(1) : "未记录"}
                unit="cm"
              />
              <StatBox
                label="记录次数"
                value={`${bodyMeasurementLogs.length}`}
                unit="次"
              />
            </div>
          )}
        </div>
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
          <>
            <MacroDonut
              proteinG={totalProtein}
              carbsG={totalCarbs}
              fatG={totalFat}
            />
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="text-center">
                <p className="text-2xs text-slate-400">蛋白质</p>
                <p className="text-sm font-bold text-purple-600">
                  {totalProtein.toFixed(0)}g
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xs text-slate-400">碳水</p>
                <p className="text-sm font-bold text-amber-600">
                  {totalCarbs.toFixed(0)}g
                </p>
              </div>
              <div className="text-center">
                <p className="text-2xs text-slate-400">脂肪</p>
                <p className="text-sm font-bold text-emerald-600">
                  {totalFat.toFixed(0)}g
                </p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Stats summary */}
      <div className="glass-card">
        <h2 className="mb-4 text-slate-800">数据摘要</h2>
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="日均热量" value={`${avgKcal}`} unit="kcal" />
          <StatBox label="日均蛋白质" value={avgProtein} unit="g" />
          <StatBox
            label="达标天数"
            value={`${onTargetDays}`}
            unit={`/ ${data.length}`}
          />
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
        <span className="ml-0.5 text-xs font-normal text-slate-400">
          {unit}
        </span>
      </p>
      <p className="mt-1 text-[10px] font-medium text-slate-400">{label}</p>
    </div>
  );
}
