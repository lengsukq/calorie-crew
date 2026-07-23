import type { MealType } from "@/lib/db/schema";

/**
 * 根据当前时间推断最可能的餐次，作为记录表单的智能默认值。
 * - 05:00–09:59 → 早餐
 * - 10:00–13:59 → 午餐
 * - 14:00–16:59 → 加餐
 * - 17:00–20:59 → 晚餐
 * - 其余时段（深夜/凌晨）→ 加餐
 */
export function inferMealType(date: Date = new Date()): MealType {
  const hour = date.getHours();
  if (hour >= 5 && hour < 10) return "breakfast";
  if (hour >= 10 && hour < 14) return "lunch";
  if (hour >= 14 && hour < 17) return "snack";
  if (hour >= 17 && hour < 21) return "dinner";
  return "snack";
}
