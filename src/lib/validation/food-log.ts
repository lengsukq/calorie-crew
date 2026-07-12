import { z } from "zod";
import { mealTypes } from "@/lib/db/schema";

export const foodLogSchema = z.object({
  logDate: z.string().date(),
  mealType: z.enum(mealTypes),
  foodName: z.string().trim().min(1).max(120),
  servingDescription: z.string().trim().min(1).max(120),
  calories: z.number().int().min(0).max(10000),
  proteinG: z.number().min(0).max(1000),
  carbsG: z.number().min(0).max(1000),
  fatG: z.number().min(0).max(1000),
});
