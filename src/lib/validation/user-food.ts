import { z } from "zod";

export const userFoodSchema = z.object({
  name: z.string().trim().min(1).max(120),
  servingDescription: z.string().trim().max(120).optional().default(""),
  calories: z.number().int().min(0).max(10000),
  proteinG: z.number().min(0).max(1000),
  carbsG: z.number().min(0).max(1000),
  fatG: z.number().min(0).max(1000),
});

export const userFoodUpdateSchema = userFoodSchema
  .partial()
  .extend({ isFavorite: z.boolean().optional() })
  .refine((value) => Object.keys(value).length > 0, "至少需要提供一个要更新的字段");
