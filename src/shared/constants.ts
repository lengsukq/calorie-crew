import type { MealType } from "@/lib/db/schema";
import type {
  ActivityLevel,
  AiAdviceFrequency,
  HealthGoal,
  ProfileGender,
} from "@/lib/db/schema";
import {
  Sunrise,
  Sun,
  Sunset,
  Moon,
  type LucideIcon,
} from "lucide-react";

export const MEAL_ORDER: MealType[] = ["breakfast", "lunch", "dinner", "snack"];

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "早餐",
  lunch: "午餐",
  dinner: "晚餐",
  snack: "加餐",
};

export const MEAL_ICONS: Record<MealType, LucideIcon> = {
  breakfast: Sunrise,
  lunch: Sun,
  dinner: Sunset,
  snack: Moon,
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

export type AchievementMetric = "foodLogs" | "streak";

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  metric: AchievementMetric;
  target: number;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  { id: "first_log", title: "初次记录", description: "记录第一笔饮食", metric: "foodLogs", target: 1 },
  { id: "logs_30", title: "持之以恒", description: "累计记录 30 餐", metric: "foodLogs", target: 30 },
  { id: "logs_100", title: "百餐达人", description: "累计记录 100 餐", metric: "foodLogs", target: 100 },
  { id: "streak_7", title: "七日连击", description: "连续记录 7 天", metric: "streak", target: 7 },
  { id: "streak_30", title: "月度坚持", description: "连续记录 30 天", metric: "streak", target: 30 },
];

/** Macro calorie split per health goal. Ratios always sum to 1. */
export const MACRO_RATIOS_BY_GOAL: Record<
  HealthGoal,
  { protein: number; carbs: number; fat: number }
> = {
  lose_weight: { protein: 0.3, carbs: 0.4, fat: 0.3 },
  gain_muscle: { protein: 0.3, carbs: 0.5, fat: 0.2 },
  maintain: { protein: 0.2, carbs: 0.5, fat: 0.3 },
  general_health: { protein: 0.2, carbs: 0.5, fat: 0.3 },
} as const;

export const KCAL_PER_GRAM = {
  protein: 4,
  carbs: 4,
  fat: 9,
} as const;

export function calculateMacroTargets(
  totalKcal: number,
  goal: HealthGoal = "general_health",
): {
  proteinG: number;
  carbsG: number;
  fatG: number;
} {
  const ratios = MACRO_RATIOS_BY_GOAL[goal];
  return {
    proteinG: Math.round((totalKcal * ratios.protein) / KCAL_PER_GRAM.protein),
    carbsG: Math.round((totalKcal * ratios.carbs) / KCAL_PER_GRAM.carbs),
    fatG: Math.round((totalKcal * ratios.fat) / KCAL_PER_GRAM.fat),
  };
}
