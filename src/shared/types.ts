import type { MealType } from "@/lib/db/schema";

export interface FoodLogEntry {
  id: string;
  mealType: MealType;
  foodName: string;
  calories: number;
  servingDescription: string;
  proteinG: string;
  carbsG: string;
  fatG: string;
}

export interface DailySummary {
  totalKcal: number;
  remainingKcal: number;
  totalProteinG: string;
  totalCarbsG: string;
  totalFatG: string;
}

export interface HistoryDay {
  logDate: string;
  targetKcal: number;
  totalKcal: number;
  remainingKcal: number;
  totalProteinG: string;
  totalCarbsG: string;
  totalFatG: string;
}

export interface FoodLogFormData {
  mealType: MealType;
  foodName: string;
  servingDescription: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}
