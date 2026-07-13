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

export const waterLogSchema = z.object({
  logDate: localDateStringSchema,
  amountMl: z.number().int().min(1).max(10000),
  note: optionalNoteSchema,
});

export const sleepLogSchema = z.object({
  logDate: localDateStringSchema,
  sleepMinutes: z.number().int().min(0).max(1440),
  quality: z.number().int().min(1).max(5),
  note: optionalNoteSchema,
});

export const bodyMeasurementSchema = z.object({
  logDate: localDateStringSchema,
  chestCm: z.coerce.number().min(30).max(200).nullable().optional(),
  waistCm: z.coerce.number().min(40).max(200).nullable().optional(),
  hipCm: z.coerce.number().min(40).max(200).nullable().optional(),
  armCm: z.coerce.number().min(15).max(80).nullable().optional(),
  legCm: z.coerce.number().min(20).max(120).nullable().optional(),
  note: optionalNoteSchema,
});
