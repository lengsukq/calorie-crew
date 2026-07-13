import {
  boolean,
  date,
  integer,
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
    remainingKcal: integer("remaining_kcal").notNull().default(2000),
    totalProteinG: numeric("total_protein_g", { precision: 8, scale: 2 }).notNull().default("0"),
    totalCarbsG: numeric("total_carbs_g", { precision: 8, scale: 2 }).notNull().default("0"),
    totalFatG: numeric("total_fat_g", { precision: 8, scale: 2 }).notNull().default("0"),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique("daily_summaries_user_date_unique").on(table.userId, table.logDate)],
);

export const mealTypes = ["breakfast", "lunch", "dinner", "snack"] as const;
export type MealType = (typeof mealTypes)[number];

export const userAiConfigs = pgTable(
  "user_ai_configs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    engine: text("engine").default("siliconflow"),
    baseUrl: text("base_url"),
    model: text("model"),
    apiKey: text("api_key"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [unique("user_ai_configs_user_id_unique").on(table.userId)],
);
