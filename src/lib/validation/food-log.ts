import { z } from "zod";
import { mealTypes } from "@/lib/db/schema";
import { isValidLocalDateString } from "@/lib/date";

export const localDateStringSchema = z
  .string()
  .refine(isValidLocalDateString, "日期必须是有效的 YYYY-MM-DD 格式");

export const foodLogSchema = z.object({
  logDate: localDateStringSchema,
  mealType: z.enum(mealTypes),
  foodName: z.string().trim().min(1).max(120),
  servingDescription: z.string().trim().min(1).max(120),
  calories: z.number().int().min(0).max(10000),
  proteinG: z.number().min(0).max(1000),
  carbsG: z.number().min(0).max(1000),
  fatG: z.number().min(0).max(1000),
  note: z.string().trim().max(300).optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(40)).max(10).optional().default([]),
});

export const foodLogUpdateSchema = foodLogSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "至少需要提供一个要更新的字段",
);

export const requiredDateQuerySchema = z.object({
  date: localDateStringSchema,
});

export const optionalDateQuerySchema = z.object({
  date: localDateStringSchema.optional(),
});
