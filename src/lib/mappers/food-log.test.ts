import { describe, expect, it } from "vitest";
import { foodLogEntryToFormData } from "./food-log";
import type { FoodLogEntry } from "@/shared/types";

describe("foodLogEntryToFormData", () => {
  it("converts string macro fields to numbers", () => {
    const entry: FoodLogEntry = {
      id: "1",
      mealType: "breakfast",
      foodName: "燕麦",
      servingDescription: "1碗",
      calories: 150,
      proteinG: "5.50",
      carbsG: "27.00",
      fatG: "3.00",
    };

    expect(foodLogEntryToFormData(entry)).toEqual({
      mealType: "breakfast",
      foodName: "燕麦",
      servingDescription: "1碗",
      calories: 150,
      proteinG: 5.5,
      carbsG: 27,
      fatG: 3,
    });
  });
});
