"use client";

import type { ExerciseLogEntry } from "@/shared/types";

interface ExerciseStatsPanelProps {
  logs: ExerciseLogEntry[];
}

export function ExerciseStatsPanel({ logs }: ExerciseStatsPanelProps) {
  const totalCaloriesBurned = logs.reduce((sum, log) => sum + log.caloriesBurned, 0);
  const totalDurationMinutes = logs.reduce((sum, log) => sum + log.durationMinutes, 0);
  const averageDurationMinutes = logs.length > 0 ? Math.round(totalDurationMinutes / logs.length) : 0;
  const exerciseTypeStats = Object.entries(
    logs.reduce<Record<string, number>>((stats, log) => {
      stats[log.exerciseType] = (stats[log.exerciseType] ?? 0) + log.caloriesBurned;
      return stats;
    }, {}),
  ).sort((firstStat, secondStat) => secondStat[1] - firstStat[1]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <StatBox label="运动次数" value={`${logs.length}`} unit="次" />
        <StatBox label="总消耗" value={`${totalCaloriesBurned}`} unit="kcal" />
        <StatBox label="平均时长" value={`${averageDurationMinutes}`} unit="分钟" />
      </div>

      {exerciseTypeStats.length === 0 ? (
        <p className="rounded-md border border-dashed py-4 text-center text-sm text-muted-foreground">
          暂无运动统计数据
        </p>
      ) : (
        <div className="space-y-3">
          {exerciseTypeStats.map(([exerciseType, caloriesBurned]) => {
            const percentage = totalCaloriesBurned > 0 ? (caloriesBurned / totalCaloriesBurned) * 100 : 0;
            return (
              <div key={exerciseType}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{exerciseType}</span>
                  <span className="text-muted-foreground tabular-nums">{caloriesBurned} kcal</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.max(percentage, 4)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface StatBoxProps {
  label: string;
  value: string;
  unit: string;
}

function StatBox({ label, value, unit }: StatBoxProps) {
  return (
    <div className="rounded-lg border bg-card p-3 text-center">
      <p className="text-lg font-bold text-foreground tabular-nums">
        {value}
        <span className="ml-0.5 text-xs font-normal text-muted-foreground">{unit}</span>
      </p>
      <p className="mt-1 text-[11px] font-medium text-muted-foreground">{label}</p>
    </div>
  );
}
