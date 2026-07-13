import type { FoodLogEntry, FoodLogFormData } from "@/shared/types";

export function foodLogEntryToFormData(log: FoodLogEntry): FoodLogFormData {
  return {
    mealType: log.mealType,
    foodName: log.foodName,
    servingDescription: log.servingDescription,
    calories: log.calories,
    proteinG: Number(log.proteinG),
    carbsG: Number(log.carbsG),
    fatG: Number(log.fatG),
  };
}
