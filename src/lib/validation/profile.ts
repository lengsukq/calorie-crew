import { z } from "zod";
import {
  activityLevels,
  aiAdviceFrequencies,
  aiAdviceTypes,
  healthGoals,
  profileGenders,
} from "@/lib/db/schema";
import { localDateStringSchema } from "@/lib/validation/food-log";

export const profileUpdateSchema = z.object({
  displayName: z.string().trim().max(80).nullable().optional(),
  birthDate: localDateStringSchema.nullable().optional(),
  gender: z.enum(profileGenders).optional(),
  heightCm: z.number().int().min(80).max(260).nullable().optional(),
  activityLevel: z.enum(activityLevels).optional(),
  healthGoal: z.enum(healthGoals).optional(),
  weightTargetKg: z.coerce.number().min(20).max(500).nullable().optional(),
  aiAdviceEnabled: z.boolean().optional(),
  aiAdviceFrequency: z.enum(aiAdviceFrequencies).optional(),
});

export const adviceTypeQuerySchema = z.object({
  type: z.enum(aiAdviceTypes).optional(),
  range: z.enum(["7d", "30d", "90d"]).optional(),
});

export const generateAdviceSchema = z.object({
  type: z.enum(aiAdviceTypes),
  force: z.boolean().optional().default(false),
});
