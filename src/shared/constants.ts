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
