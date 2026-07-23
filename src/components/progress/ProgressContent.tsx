"use client";

import { useMemo, useState } from "react";
import { TrendingUp, Scale, Moon, Ruler, PieChart, Droplets } from "lucide-react";
import { useBodyMeasurements } from "@/hooks/useBodyMeasurements";
import { useExerciseLogs } from "@/hooks/useExerciseLogs";
import { useHistory } from "@/hooks/useHistory";
import { useProfile } from "@/hooks/useProfile";
import { useSleepLogs } from "@/hooks/useSleepLogs";
import { useWaterLogs } from "@/hooks/useWaterLogs";
import { useWeightLogs } from "@/hooks/useWeightLogs";
import { CalorieChart } from "@/components/progress/CalorieChart";
import { ExerciseStatsPanel } from "@/components/progress/ExerciseStatsPanel";
import { MacroDonut } from "@/components/progress/MacroDonut";
import { SleepTrendChart } from "@/components/progress/SleepTrendChart";
import { WaterTrendChart } from "@/components/progress/WaterTrendChart";
import { WeightTrendChart } from "@/components/progress/WeightTrendChart";
import { EmptyState, StatBox } from "@/components/progress/ProgressParts";
import { StatCard } from "@/components/shared/StatCard";
import { AiAdviceCard } from "@/components/shared/AiAdviceCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Segmented } from "@/components/ui/segmented";
import { Skeleton } from "@/components/ui/skeleton";
import { addDays, todayDate } from "@/lib/date";
import { calculateMacroTargets } from "@/shared/constants";
import {
  calculateOnTargetRate,
  calculateStreak,
  calculateWeekComparison,
} from "@/lib/stats/history-stats";

type Period = 7 | 30 | 365;

interface ProgressContentProps {
  calorieTarget: number;
  weightTargetKg: string | null;
}

function getPeriodStartDate(period: Period): string {
  return addDays(todayDate(), -period + 1);
}

function formatRangeLabel(period: Period): string {
  if (period === 365) return "全部记录";
  return `近 ${period} 天`;
}

export function ProgressContent({ calorieTarget, weightTargetKg }: ProgressContentProps) {
  const [period, setPeriod] = useState<Period>(7);
  const { data, loading } = useHistory(period);
  const { data: profileData } = useProfile();
  const rangeStartDate = getPeriodStartDate(period);
  const rangeEndDate = todayDate();
  const { data: weightLogs, loading: weightLoading } = useWeightLogs({ startDate: rangeStartDate, endDate: rangeEndDate });
  const { data: exerciseLogs, loading: exerciseLoading } = useExerciseLogs({ startDate: rangeStartDate, endDate: rangeEndDate });
  const { data: sleepLogs, loading: sleepLoading } = useSleepLogs({ startDate: rangeStartDate, endDate: rangeEndDate });
  const { data: waterLogs, loading: waterLoading } = useWaterLogs({ startDate: rangeStartDate, endDate: rangeEndDate });
  const { data: bodyMeasurementLogs, loading: bodyMeasurementLoading } = useBodyMeasurements({ startDate: rangeStartDate, endDate: rangeEndDate });

  const waterTargetMl = profileData?.profile.waterTargetMl ?? 2000;
  const sleepTargetMinutes = profileData?.profile.sleepTargetMinutes ?? 480;
  const healthGoal = profileData?.profile.healthGoal ?? "general_health";
  const aiAdviceFrequency = profileData?.profile.aiAdviceFrequency ?? "daily";
  const macroTargets = calculateMacroTargets(calorieTarget, healthGoal);

  const sortedData = useMemo(
    () => [...data].sort((left, right) => left.logDate.localeCompare(right.logDate)),
    [data],
  );

  const avgKcal = data.length > 0 ? Math.round(data.reduce((sum, day) => sum + day.totalKcal, 0) / data.length) : 0;
  const avgProtein =
    data.length > 0
      ? (data.reduce((sum, day) => sum + parseFloat(day.totalProteinG || "0"), 0) / data.length).toFixed(1)
      : "0";

  const onTargetDays = data.filter((day) => day.totalKcal <= day.targetKcal).length;
  const streak = useMemo(() => calculateStreak(data), [data]);
  const onTargetRate = useMemo(() => calculateOnTargetRate(data), [data]);
  const weekComparison = useMemo(() => calculateWeekComparison(data), [data]);

  const totalProtein = data.reduce((sum, day) => sum + parseFloat(day.totalProteinG || "0"), 0);
  const totalCarbs = data.reduce((sum, day) => sum + parseFloat(day.totalCarbsG || "0"), 0);
  const totalFat = data.reduce((sum, day) => sum + parseFloat(day.totalFatG || "0"), 0);

  return (
    <div className="stack page-enter">
      <Segmented
        options={[
          { value: 7, label: "近 7 天" },
          { value: 30, label: "近 30 天" },
          { value: 365, label: "全部" },
        ]}
        value={period}
        onChange={setPeriod}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="日均热量" value={avgKcal} unit="kcal" accentColor="primary" />
        <StatCard label="日均蛋白质" value={avgProtein} unit="g" accentColor="purple" />
        <StatCard label="达标率" value={`${onTargetRate}%`} accentColor="success" />
        <StatCard label="最长连续" value={streak} unit="天" accentColor="warning" />
      </div>

      <AiAdviceCard title="AI 健康周报" type="weekly_summary" autoGenerate={aiAdviceFrequency === "weekly"} />

      {weekComparison && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">热量对比</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-[11px] font-medium text-muted-foreground">上周日均</p>
                <p className="mt-1 text-xl font-bold text-muted-foreground tabular-nums">{weekComparison.previousAvg}</p>
                <p className="text-[11px] text-muted-foreground">kcal</p>
              </div>
              <div className="flex items-center justify-center">
                <span
                  className={`inline-flex items-center gap-1 rounded-md px-3 py-1 text-xs font-semibold ${
                    weekComparison.diff <= 0
                      ? "bg-success/10 text-success"
                      : "bg-danger/10 text-danger"
                  }`}
                >
                  {weekComparison.diff <= 0 ? "↓" : "↑"} {Math.abs(weekComparison.diff)} kcal
                </span>
              </div>
              <div className="text-center">
                <p className="text-[11px] font-medium text-muted-foreground">本周日均</p>
                <p className="mt-1 text-xl font-bold text-foreground tabular-nums">{weekComparison.currentAvg}</p>
                <p className="text-[11px] text-muted-foreground">kcal</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">热量趋势</CardTitle>
          <p className="text-xs text-muted-foreground">{formatRangeLabel(period)}·每日摄入与目标对比</p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : data.length === 0 ? (
            <EmptyState icon={<TrendingUp className="h-8 w-8" />} text="暂无足够数据，多记录几天再来看看吧" />
          ) : (
            <CalorieChart data={sortedData} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">体重趋势</CardTitle>
          <p className="text-xs text-muted-foreground">{formatRangeLabel(period)}·体重变化与目标线</p>
        </CardHeader>
        <CardContent>
          {weightLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : weightLogs.length === 0 ? (
            <EmptyState icon={<Scale className="h-8 w-8" />} text="暂无体重记录，先在今日页面记录一次吧" />
          ) : (
            <>
              <WeightTrendChart logs={weightLogs} weightTargetKg={weightTargetKg} />
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatBox label="起始体重" value={Number(weightLogs[0].weightKg).toFixed(1)} unit="kg" />
                <StatBox label="当前体重" value={Number(weightLogs[weightLogs.length - 1].weightKg).toFixed(1)} unit="kg" />
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
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  可在个人资料中设置体重目标，趋势图会显示目标线。
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">运动统计</CardTitle>
        </CardHeader>
        <CardContent>
          {exerciseLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <ExerciseStatsPanel logs={exerciseLogs} />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">饮水趋势</CardTitle>
          <p className="text-xs text-muted-foreground">{formatRangeLabel(period)}·每日饮水与目标对比</p>
        </CardHeader>
        <CardContent>
          {waterLoading ? (
            <Skeleton className="h-48 w-full" />
          ) : waterLogs.length === 0 ? (
            <EmptyState icon={<Droplets className="h-8 w-8" />} text="暂无饮水记录，先在今日页面记录一杯吧" />
          ) : (
            <WaterTrendChart logs={waterLogs} targetMl={waterTargetMl} />
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">睡眠统计</CardTitle>
          </CardHeader>
          <CardContent>
            {sleepLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : sleepLogs.length === 0 ? (
              <EmptyState icon={<Moon className="h-8 w-8" />} text="暂无睡眠记录" />
            ) : (
              <>
                <SleepTrendChart logs={sleepLogs} targetMinutes={sleepTargetMinutes} />
                <div className="mt-4 grid grid-cols-2 gap-3">
                <StatBox
                  label="平均时长"
                  value={`${Math.round(sleepLogs.reduce((sum, log) => sum + log.sleepMinutes, 0) / sleepLogs.length / 60 * 10) / 10}`}
                  unit="小时"
                />
                <StatBox
                  label="平均质量"
                  value={`${(sleepLogs.reduce((sum, log) => sum + log.quality, 0) / sleepLogs.length).toFixed(1)}`}
                  unit="/ 5"
                />
              </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">身体数据</CardTitle>
          </CardHeader>
          <CardContent>
            {bodyMeasurementLoading ? (
              <Skeleton className="h-24 w-full" />
            ) : bodyMeasurementLogs.length === 0 ? (
              <EmptyState icon={<Ruler className="h-8 w-8" />} text="暂无身体数据记录" />
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <StatBox
                  label="最新腰围"
                  value={bodyMeasurementLogs[0].waistCm ? Number(bodyMeasurementLogs[0].waistCm).toFixed(1) : "未记录"}
                  unit="cm"
                />
                <StatBox label="记录次数" value={`${bodyMeasurementLogs.length}`} unit="次" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">营养素分布</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-48 w-full" />
          ) : data.length === 0 ? (
            <EmptyState icon={<PieChart className="h-8 w-8" />} text="暂无营养素数据" />
          ) : (
            <>
              <MacroDonut proteinG={totalProtein} carbsG={totalCarbs} fatG={totalFat} />
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-[11px] text-muted-foreground">蛋白质</p>
                  <p className="text-sm font-bold text-chart-4 tabular-nums">{totalProtein.toFixed(1)} g</p>
                </div>
                <div className="text-center">
                  <p className="text-[11px] text-muted-foreground">碳水</p>
                  <p className="text-sm font-bold text-chart-3 tabular-nums">{totalCarbs.toFixed(1)} g</p>
                </div>
                <div className="text-center">
                  <p className="text-[11px] text-muted-foreground">脂肪</p>
                  <p className="text-sm font-bold text-chart-2 tabular-nums">{totalFat.toFixed(1)} g</p>
                </div>
              </div>
              <p className="mt-3 text-center text-[11px] text-muted-foreground">
                每日目标（{calorieTarget} kcal）：蛋白 {macroTargets.proteinG}g · 碳水 {macroTargets.carbsG}g · 脂肪 {macroTargets.fatG}g
              </p>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">数据摘要</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            <StatBox label="日均热量" value={`${avgKcal}`} unit="kcal" />
            <StatBox label="日均蛋白质" value={avgProtein} unit="g" />
            <StatBox label="达标天数" value={`${onTargetDays}`} unit={`/ ${data.length}`} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
