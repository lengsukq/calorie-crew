import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  addDays,
  formatDisplayDate,
  formatLocalDate,
  isValidLocalDateString,
  parseLocalDate,
  todayDate,
} from "./date";

describe("local date utilities", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 6, 13, 12, 0, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("formats dates with local calendar fields", () => {
    expect(formatLocalDate(new Date(2026, 0, 5, 23, 30, 0))).toBe("2026-01-05");
  });

  it("returns today's local date without UTC conversion", () => {
    expect(todayDate()).toBe("2026-07-13");
  });

  it("rejects impossible calendar dates", () => {
    expect(isValidLocalDateString("2026-02-29")).toBe(false);
    expect(isValidLocalDateString("2024-02-29")).toBe(true);
    expect(parseLocalDate("not-a-date")).toBeNull();
  });

  it("adds days across month boundaries", () => {
    expect(addDays("2026-07-01", -1)).toBe("2026-06-30");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("formats relative display labels", () => {
    expect(formatDisplayDate("2026-07-13")).toBe("今天");
    expect(formatDisplayDate("2026-07-12")).toBe("昨天");
    expect(formatDisplayDate("2026-07-14")).toBe("明天");
    expect(formatDisplayDate("2026-07-10")).toBe("2026年7月10日");
  });
});
