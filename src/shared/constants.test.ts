import { describe, expect, it } from "vitest";
import { MEAL_ORDER, MEAL_LABELS, MEAL_ICONS } from "./constants";

describe("MEAL_ORDER", () => {
  it("should contain all 4 meal types in correct order", () => {
    expect(MEAL_ORDER).toEqual(["breakfast", "lunch", "dinner", "snack"]);
  });
});

describe("MEAL_LABELS", () => {
  it("should have labels for all meal types", () => {
    expect(MEAL_LABELS.breakfast).toBe("早餐");
    expect(MEAL_LABELS.lunch).toBe("午餐");
    expect(MEAL_LABELS.dinner).toBe("晚餐");
    expect(MEAL_LABELS.snack).toBe("加餐");
  });

  it("should have keys matching MEAL_ORDER", () => {
    const keys = Object.keys(MEAL_LABELS);
    expect(keys).toEqual(MEAL_ORDER);
  });
});

describe("MEAL_ICONS", () => {
  it("should have icons for all meal types", () => {
    expect(MEAL_ICONS.breakfast).toBeTruthy();
    expect(MEAL_ICONS.lunch).toBeTruthy();
    expect(MEAL_ICONS.dinner).toBeTruthy();
    expect(MEAL_ICONS.snack).toBeTruthy();
  });

  it("should have keys matching MEAL_ORDER", () => {
    const keys = Object.keys(MEAL_ICONS);
    expect(keys).toEqual(MEAL_ORDER);
  });
});
