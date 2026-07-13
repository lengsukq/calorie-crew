import { describe, expect, it } from "vitest";
import {
  calculateOnTargetRate,
  calculateStreak,
  calculateWeekComparison,
} from "./history-stats";
import type { HistoryDay } from "@/shared/types";

function makeDay(logDate: string, totalKcal: number, targetKcal = 2000): HistoryDay {
  return {
    logDate,
    targetKcal,
    totalKcal,
    totalExerciseKcal: 0,
    netKcal: totalKcal,
    remainingKcal: targetKcal - totalKcal,
    totalProteinG: "0",
    totalCarbsG: "0",
    totalFatG: "0",
  };
}

describe("calculateStreak", () => {
  it("returns 0 for empty data", () => {
    expect(calculateStreak([])).toBe(0);
  });

  it("finds the longest consecutive day run", () => {
    const data = [
      makeDay("2026-07-01", 1800),
      makeDay("2026-07-02", 1900),
      makeDay("2026-07-03", 2000),
      makeDay("2026-07-05", 1700),
      makeDay("2026-07-06", 1600),
    ];
    expect(calculateStreak(data)).toBe(3);
  });
});

describe("calculateOnTargetRate", () => {
  it("returns 0 for empty data", () => {
    expect(calculateOnTargetRate([])).toBe("0");
  });

  it("computes percentage of days within target", () => {
    const data = [
      makeDay("2026-07-01", 1800, 2000),
      makeDay("2026-07-02", 2100, 2000),
      makeDay("2026-07-03", 2000, 2000),
      makeDay("2026-07-04", 2500, 2000),
    ];
    expect(calculateOnTargetRate(data)).toBe("50");
  });
});

describe("calculateWeekComparison", () => {
  it("returns null when fewer than 14 days", () => {
    expect(calculateWeekComparison([makeDay("2026-07-01", 1800)])).toBeNull();
  });

  it("compares the last 7 days with the previous 7 days", () => {
    const data = Array.from({ length: 14 }, (_, index) => {
      const day = String(index + 1).padStart(2, "0");
      const totalKcal = index < 7 ? 1800 : 2000;
      return makeDay(`2026-07-${day}`, totalKcal);
    });

    expect(calculateWeekComparison(data)).toEqual({
      currentAvg: 2000,
      previousAvg: 1800,
      diff: 200,
    });
  });
});
