import type { MealType } from "@/lib/db/schema";
import type { ActivityLevel, AiAdviceFrequency, HealthGoal, ProfileGender } from "@/lib/db/schema";

export const MEAL_ORDER: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "早餐",
  lunch: "午餐",
  dinner: "晚餐",
  snack: "加餐",
};

export const MEAL_ICONS: Record<MealType, string> = {
  breakfast: "🌅",
  lunch: "🌞",
  dinner: "🌆",
  snack: "🌙",
};

export const PROFILE_GENDER_LABELS: Record<ProfileGender, string> = {
  male: "男",
  female: "女",
  other: "其他",
};

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  sedentary: "久坐",
  light: "轻度活动",
  moderate: "中度活动",
  active: "活跃",
  very_active: "非常活跃",
};

export const HEALTH_GOAL_LABELS: Record<HealthGoal, string> = {
  lose_weight: "减脂",
  maintain: "维持",
  gain_muscle: "增肌",
  general_health: "一般健康",
};

export const AI_ADVICE_FREQUENCY_LABELS: Record<AiAdviceFrequency, string> = {
  daily: "每日",
  weekly: "每周",
  off: "关闭",
};

/** Default macro calorie split used for progress bars when no personal targets exist. */
export const DEFAULT_MACRO_CALORIE_RATIOS = {
  protein: 0.2,
  carbs: 0.5,
  fat: 0.3,
} as const;

export const KCAL_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
} as const;

export function calculateMacroTargets(totalKcal: number): {
  proteinG: number;
  carbsG: number;
  fatG: number;
} {
  return {
    proteinG: Math.round((totalKcal * DEFAULT_MACRO_CALORIE_RATIOS.protein) / KCAL_PER_GRAM.protein),
    carbsG: Math.round((totalKcal * DEFAULT_MACRO_CALORIE_RATIOS.carbs) / KCAL_PER_GRAM.carbs),
    fatG: Math.round((totalKcal * DEFAULT_MACRO_CALORIE_RATIOS.fat) / KCAL_PER_GRAM.fat),
  };
}
