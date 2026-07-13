import type { ActivityLevel, HealthGoal, ProfileGender } from "@/lib/db/schema";
import { parseLocalDate, todayDate } from "@/lib/date";

export interface SuggestedIntakeRange {
  min: number;
  max: number;
}

export interface BmiCategory {
  label: string;
  color: "blue" | "green" | "orange" | "red";
}

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

const BMI_CATEGORIES: Array<{ max: number } & BmiCategory> = [
  { max: 18.5, label: "偏瘦", color: "blue" },
  { max: 24, label: "正常", color: "green" },
  { max: 28, label: "偏胖", color: "orange" },
  { max: Infinity, label: "肥胖", color: "red" },
];

export function calculateAge(birthDate: string, currentDate = todayDate()): number | null {
  const birth = parseLocalDate(birthDate);
  const today = parseLocalDate(currentDate);
  if (!birth || !today || birth > today) return null;

  let age = today.getFullYear() - birth.getFullYear();
  const hasBirthdayPassedThisYear =
    today.getMonth() > birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());

  if (!hasBirthdayPassedThisYear) age -= 1;
  return age >= 0 ? age : null;
}

export function calculateBmi(heightCm: number, weightKg: number): number {
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

export function calculateBmr(
  gender: ProfileGender,
  heightCm: number,
  weightKg: number,
  age: number,
): number {
  const maleBmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  const femaleBmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;

  if (gender === "male") return Math.round(maleBmr);
  if (gender === "female") return Math.round(femaleBmr);
  return Math.round((maleBmr + femaleBmr) / 2);
}

export function calculateTdee(bmr: number, activityLevel: ActivityLevel): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

export function getSuggestedIntakeRange(tdee: number, healthGoal: HealthGoal): SuggestedIntakeRange {
  switch (healthGoal) {
    case "lose_weight":
      return { min: Math.round(tdee * 0.75), max: Math.round(tdee * 0.85) };
    case "gain_muscle":
      return { min: Math.round(tdee * 1.05), max: Math.round(tdee * 1.15) };
    case "maintain":
    case "general_health":
    default:
      return { min: Math.round(tdee * 0.95), max: Math.round(tdee * 1.05) };
  }
}

export function getBmiCategory(bmi: number): BmiCategory {
  return BMI_CATEGORIES.find((category) => bmi < category.max) ?? BMI_CATEGORIES[BMI_CATEGORIES.length - 1];
}
