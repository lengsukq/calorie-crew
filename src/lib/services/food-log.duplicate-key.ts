import type { MealType } from "@/lib/db/schema";

export interface FoodLogDuplicateKeyFields {
  mealType: MealType;
  foodName: string;
  servingDescription: string;
  calories: number;
  proteinG: string | number;
  carbsG: string | number;
  fatG: string | number;
}

export function buildFoodDuplicateKey(fields: FoodLogDuplicateKeyFields): string {
  return [
    fields.mealType,
    fields.foodName,
    fields.servingDescription,
    fields.calories,
    fields.proteinG,
    fields.carbsG,
    fields.fatG,
  ].join("::");
}

export function selectFoodLogsToCopy<T extends FoodLogDuplicateKeyFields>(
  sourceRows: T[],
  existingTargetLogs: FoodLogDuplicateKeyFields[],
): T[] {
  const duplicateKeys = new Set(existingTargetLogs.map(buildFoodDuplicateKey));
  return sourceRows.filter((row) => !duplicateKeys.has(buildFoodDuplicateKey(row)));
}
