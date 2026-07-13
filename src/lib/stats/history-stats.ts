import type { HistoryDay } from "@/shared/types";

export function calculateStreak(data: HistoryDay[]): number {
  if (data.length === 0) return 0;

  const sorted = [...data].sort((left, right) => left.logDate.localeCompare(right.logDate));
  let maxStreak = 1;
  let currentStreak = 1;

  for (let index = 1; index < sorted.length; index += 1) {
    const previousDate = new Date(`${sorted[index - 1].logDate}T00:00:00`);
    const currentDate = new Date(`${sorted[index].logDate}T00:00:00`);
    const diffDays = Math.round((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      currentStreak += 1;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else if (diffDays > 1) {
      currentStreak = 1;
    }
  }

  return maxStreak;
}

export function calculateOnTargetRate(data: HistoryDay[]): string {
  if (data.length === 0) return "0";
  const onTargetCount = data.filter((day) => day.totalKcal <= day.targetKcal).length;
  return ((onTargetCount / data.length) * 100).toFixed(0);
}

export function calculateWeekComparison(data: HistoryDay[]): {
  currentAvg: number;
  previousAvg: number;
  diff: number;
} | null {
  if (data.length < 14) return null;

  const sorted = [...data].sort((left, right) => left.logDate.localeCompare(right.logDate));
  const recentSevenDays = sorted.slice(-7);
  const previousSevenDays = sorted.slice(-14, -7);

  const currentAvg = Math.round(
    recentSevenDays.reduce((sum, day) => sum + day.totalKcal, 0) / recentSevenDays.length,
  );
  const previousAvg = Math.round(
    previousSevenDays.reduce((sum, day) => sum + day.totalKcal, 0) / previousSevenDays.length,
  );

  return {
    currentAvg,
    previousAvg,
    diff: currentAvg - previousAvg,
  };
}
