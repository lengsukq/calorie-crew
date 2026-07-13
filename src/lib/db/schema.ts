import {
  boolean,
  date,
  index,
  integer,
  json,
  numeric,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("member"),
  calorieTarget: integer("calorie_target").notNull().default(2000),
  weightTargetKg: numeric("weight_target_kg", { precision: 6, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const inviteCodes = pgTable("invite_codes", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(),
  createdByUserId: uuid("created_by_user_id").notNull().references(() => users.id),
  maxUses: integer("max_uses").notNull(),
  usedCount: integer("used_count").notNull().default(0),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const inviteUsages = pgTable("invite_usages", {
  id: uuid("id").defaultRandom().primaryKey(),
  inviteCodeId: uuid("invite_code_id").notNull().references(() => inviteCodes.id),
  inviterUserId: uuid("inviter_user_id").notNull().references(() => users.id),
  invitedUserId: uuid("invited_user_id").notNull().references(() => users.id),
  usedAt: timestamp("used_at", { withTimezone: true }).defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export const foodLogs = pgTable(
  "food_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    logDate: date("log_date").notNull(),
    mealType: text("meal_type").notNull(),
    foodName: text("food_name").notNull(),
    servingDescription: text("serving_description").notNull(),
    calories: integer("calories").notNull(),
    proteinG: numeric("protein_g", { precision: 8, scale: 2 }).notNull().default("0"),
    carbsG: numeric("carbs_g", { precision: 8, scale: 2 }).notNull().default("0"),
    fatG: numeric("fat_g", { precision: 8, scale: 2 }).notNull().default("0"),
    note: text("note"),
    tags: json("tags").$type<string[]>().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique("food_logs_user_date_id_unique").on(table.userId, table.logDate, table.id)],
);

export const dailySummaries = pgTable(
  "daily_summaries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    logDate: date("log_date").notNull(),
    targetKcal: integer("target_kcal").notNull().default(2000),
    totalKcal: integer("total_kcal").notNull().default(0),
    totalExerciseKcal: integer("total_exercise_kcal").notNull().default(0),
    netKcal: integer("net_kcal").notNull().default(0),
    remainingKcal: integer("remaining_kcal").notNull().default(2000),
    totalProteinG: numeric("total_protein_g", { precision: 8, scale: 2 }).notNull().default("0"),
    totalCarbsG: numeric("total_carbs_g", { precision: 8, scale: 2 }).notNull().default("0"),
    totalFatG: numeric("total_fat_g", { precision: 8, scale: 2 }).notNull().default("0"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique("daily_summaries_user_date_unique").on(table.userId, table.logDate)],
);

export const weightLogs = pgTable(
  "weight_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    logDate: date("log_date").notNull(),
    weightKg: numeric("weight_kg", { precision: 6, scale: 2 }).notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("weight_logs_user_date_unique").on(table.userId, table.logDate),
    index("weight_logs_user_date_idx").on(table.userId, table.logDate),
  ],
);

export const exerciseLogs = pgTable(
  "exercise_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    logDate: date("log_date").notNull(),
    exerciseType: text("exercise_type").notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    caloriesBurned: integer("calories_burned").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    unique("exercise_logs_user_date_id_unique").on(table.userId, table.logDate, table.id),
    index("exercise_logs_user_date_idx").on(table.userId, table.logDate),
  ],
);

export const profileGenders = ["male", "female", "other"] as const;
export type ProfileGender = (typeof profileGenders)[number];

export const activityLevels = ["sedentary", "light", "moderate", "active", "very_active"] as const;
export type ActivityLevel = (typeof activityLevels)[number];

export const healthGoals = ["lose_weight", "maintain", "gain_muscle", "general_health"] as const;
export type HealthGoal = (typeof healthGoals)[number];

export const aiAdviceFrequencies = ["daily", "weekly", "off"] as const;
export type AiAdviceFrequency = (typeof aiAdviceFrequencies)[number];

export const aiAdviceTypes = ["daily_diet", "weekly_summary", "bmi_alert", "goal_reminder"] as const;
export type AiAdviceType = (typeof aiAdviceTypes)[number];

export const advicePriorities = ["high", "medium", "low"] as const;
export type AdvicePriority = (typeof advicePriorities)[number];

export interface AiAdviceSuggestion {
  title: string;
  detail: string;
  priority: AdvicePriority;
}

export const userProfiles = pgTable(
  "user_profiles",
  {
    userId: uuid("user_id").primaryKey().references(() => users.id, { onDelete: "cascade" }),
    displayName: text("display_name"),
    birthDate: date("birth_date"),
    gender: text("gender", { enum: profileGenders }).default("male"),
    heightCm: integer("height_cm"),
    activityLevel: text("activity_level", { enum: activityLevels }).default("sedentary"),
    healthGoal: text("health_goal", { enum: healthGoals }).default("general_health"),
    weightTargetKg: numeric("weight_target_kg", { precision: 6, scale: 2 }),
    aiAdviceEnabled: boolean("ai_advice_enabled").notNull().default(true),
    aiAdviceFrequency: text("ai_advice_frequency", { enum: aiAdviceFrequencies }).default("daily"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("user_profiles_updated_at_idx").on(table.updatedAt)],
);

export const aiAdvices = pgTable(
  "ai_advices",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    type: text("type", { enum: aiAdviceTypes }).notNull(),
    summary: text("summary").notNull(),
    suggestions: json("suggestions").$type<AiAdviceSuggestion[]>().notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    feedback: text("feedback", { enum: ["helpful", "not_helpful"] }),
    feedbackAt: timestamp("feedback_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    dismissed: boolean("dismissed").notNull().default(false),
    dismissedAt: timestamp("dismissed_at", { withTimezone: true }),
  },
  (table) => [
    unique("ai_advices_user_type_expires_unique").on(table.userId, table.type, table.expiresAt),
    index("ai_advices_user_created_idx").on(table.userId, table.createdAt),
  ],
);

export const waterLogs = pgTable(
  "water_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    logDate: date("log_date").notNull(),
    amountMl: integer("amount_ml").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique("water_logs_user_date_id_unique").on(table.userId, table.logDate, table.id)],
);

export const sleepLogs = pgTable(
  "sleep_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    logDate: date("log_date").notNull(),
    sleepMinutes: integer("sleep_minutes").notNull(),
    quality: integer("quality").notNull().default(3),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique("sleep_logs_user_date_unique").on(table.userId, table.logDate)],
);

export const bodyMeasurements = pgTable(
  "body_measurements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    logDate: date("log_date").notNull(),
    chestCm: numeric("chest_cm", { precision: 6, scale: 2 }),
    waistCm: numeric("waist_cm", { precision: 6, scale: 2 }),
    hipCm: numeric("hip_cm", { precision: 6, scale: 2 }),
    armCm: numeric("arm_cm", { precision: 6, scale: 2 }),
    legCm: numeric("leg_cm", { precision: 6, scale: 2 }),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique("body_measurements_user_date_unique").on(table.userId, table.logDate)],
);

export const mealTypes = ["breakfast", "lunch", "dinner", "snack"] as const;
export type MealType = (typeof mealTypes)[number];

export const userAiConfigs = pgTable(
  "user_ai_configs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    baseUrl: text("base_url"),
    model: text("model"),
    apiKey: text("api_key"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique("user_ai_configs_user_id_unique").on(table.userId)],
);
