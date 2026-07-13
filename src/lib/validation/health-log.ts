import { z } from "zod";
import { localDateStringSchema } from "@/lib/validation/food-log";

const optionalNoteSchema = z.string().trim().max(300).optional().nullable();

export const dateRangeQuerySchema = z
  .object({
    startDate: localDateStringSchema,
    endDate: localDateStringSchema,
  })
  .refine((value) => value.startDate <= value.endDate, {
    message: "开始日期不能晚于结束日期",
    path: ["endDate"],
  });

export const weightLogSchema = z.object({
  logDate: localDateStringSchema,
  weightKg: z.coerce.number().positive().min(20).max(500),
  note: optionalNoteSchema,
});

export const exerciseLogSchema = z.object({
  logDate: localDateStringSchema,
  exerciseType: z.string().trim().min(1).max(80),
  durationMinutes: z.number().int().positive().max(1440),
  caloriesBurned: z.number().int().min(0).max(10000),
  note: optionalNoteSchema,
});

export const userWeightTargetSchema = z.object({
  weightTargetKg: z.coerce.number().positive().min(20).max(500).nullable(),
});
