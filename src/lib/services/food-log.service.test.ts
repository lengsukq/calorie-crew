import { describe, expect, it } from "vitest";
import {
  buildFoodDuplicateKey,
  selectFoodLogsToCopy,
  type FoodLogDuplicateKeyFields,
} from "./food-log.duplicate-key";

function makeFoodFields(
  overrides: Partial<FoodLogDuplicateKeyFields> = {},
): FoodLogDuplicateKeyFields {
  return {
    mealType: "lunch",
    foodName: "鸡胸肉",
    servingDescription: "100g",
    calories: 165,
    proteinG: "31.00",
    carbsG: "0.00",
    fatG: "3.60",
    ...overrides,
  };
}

describe("buildFoodDuplicateKey", () => {
  it("builds a stable key from meal and macro fields", () => {
    expect(buildFoodDuplicateKey(makeFoodFields())).toBe(
      "lunch::鸡胸肉::100g::165::31.00::0.00::3.60",
    );
  });
});

describe("selectFoodLogsToCopy", () => {
  it("returns empty when source list is empty", () => {
    expect(selectFoodLogsToCopy([], [makeFoodFields()])).toEqual([]);
  });

  it("keeps only non-duplicate source rows against target day logs", () => {
    const existingOnTarget = [makeFoodFields({ foodName: "米饭", calories: 200 })];
    const sourceRows = [
      makeFoodFields({ foodName: "米饭", calories: 200 }),
      makeFoodFields({ foodName: "西兰花", calories: 35 }),
    ];

    const selected = selectFoodLogsToCopy(sourceRows, existingOnTarget);
    expect(selected).toHaveLength(1);
    expect(selected[0].foodName).toBe("西兰花");
  });

  it("copies all rows when target day has no overlaps", () => {
    const sourceRows = [
      makeFoodFields({ foodName: "A" }),
      makeFoodFields({ foodName: "B" }),
    ];

    expect(selectFoodLogsToCopy(sourceRows, [])).toHaveLength(2);
  });
});
