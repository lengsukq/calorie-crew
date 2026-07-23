import { and, asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { foodLogs, type MealType } from "@/lib/db/schema";
import { recalculateDailySummary } from "@/lib/services/daily-summary.service";
import { selectFoodLogsToCopy, type FoodLogDuplicateKeyFields } from "@/lib/services/food-log.duplicate-key";

export interface FoodLogWriteInput {
  logDate: string;
  mealType: MealType;
  foodName: string;
  servingDescription: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  note?: string | null;
  tags?: string[];
}

export type FoodLogUpdateInput = Partial<FoodLogWriteInput>;

const FOOD_LOG_BATCH_COLUMNS = {
  id: true,
  userId: true,
  logDate: true,
  mealType: true,
  foodName: true,
  servingDescription: true,
  calories: true,
  proteinG: true,
  carbsG: true,
  fatG: true,
} as const;

async function findOwnedFoodLogsByIds(userId: string, ids: string[]) {
  if (ids.length === 0) return [];

  return db.query.foodLogs.findMany({
    where: and(eq(foodLogs.userId, userId), inArray(foodLogs.id, ids)),
    columns: FOOD_LOG_BATCH_COLUMNS,
  });
}

async function deleteFoodLogsByIds(userId: string, ids: string[]) {
  if (ids.length === 0) return;

  await db.delete(foodLogs).where(and(eq(foodLogs.userId, userId), inArray(foodLogs.id, ids)));
}

async function copyFoodLogsToDate(
  userId: string,
  sourceRows: Array<{
    userId: string;
    mealType: MealType;
    foodName: string;
    servingDescription: string;
    calories: number;
    proteinG: string;
    carbsG: string;
    fatG: string;
  }>,
  targetDate: string,
): Promise<number> {
  const existingTargetLogs = await db.query.foodLogs.findMany({
    where: and(eq(foodLogs.userId, userId), eq(foodLogs.logDate, targetDate)),
    columns: {
      mealType: true,
      foodName: true,
      servingDescription: true,
      calories: true,
      proteinG: true,
      carbsG: true,
      fatG: true,
    },
  });

  const rowsToCopy = selectFoodLogsToCopy(sourceRows, existingTargetLogs as FoodLogDuplicateKeyFields[]);
  if (rowsToCopy.length === 0) return 0;

  await db.insert(foodLogs).values(
    rowsToCopy.map((row) => ({
      userId: row.userId,
      logDate: targetDate,
      mealType: row.mealType,
      foodName: row.foodName,
      servingDescription: row.servingDescription,
      calories: row.calories,
      proteinG: row.proteinG,
      carbsG: row.carbsG,
      fatG: row.fatG,
    })),
  );

  return rowsToCopy.length;
}

export async function getFoodLogsByDate(userId: string, logDate: string) {
  return db.query.foodLogs.findMany({
    where: and(eq(foodLogs.userId, userId), eq(foodLogs.logDate, logDate)),
    orderBy: [asc(foodLogs.createdAt)],
  });
}

export async function copyDayFoodLogs(userId: string, sourceDate: string, targetDate: string) {
  if (sourceDate === targetDate) return 0;

  const sourceRows = await db.query.foodLogs.findMany({
    where: and(eq(foodLogs.userId, userId), eq(foodLogs.logDate, sourceDate)),
    columns: {
      userId: true,
      mealType: true,
      foodName: true,
      servingDescription: true,
      calories: true,
      proteinG: true,
      carbsG: true,
      fatG: true,
    },
  });
  if (sourceRows.length === 0) return 0;

  const copiedCount = await copyFoodLogsToDate(
    userId,
    sourceRows as Array<{
      userId: string;
      mealType: MealType;
      foodName: string;
      servingDescription: string;
      calories: number;
      proteinG: string;
      carbsG: string;
      fatG: string;
    }>,
    targetDate,
  );

  if (copiedCount > 0) {
    await recalculateDailySummary(userId, targetDate);
  }
  return copiedCount;
}

export async function createFoodLog(userId: string, data: FoodLogWriteInput) {
  const [log] = await db
    .insert(foodLogs)
    .values({
      userId,
      logDate: data.logDate,
      mealType: data.mealType,
      foodName: data.foodName,
      servingDescription: data.servingDescription,
      calories: data.calories,
      proteinG: data.proteinG.toFixed(2),
      carbsG: data.carbsG.toFixed(2),
      fatG: data.fatG.toFixed(2),
      note: data.note?.trim() ? data.note.trim() : null,
      tags: data.tags ?? [],
    })
    .returning();

  await recalculateDailySummary(userId, log.logDate);
  return log;
}

export async function updateFoodLog(userId: string, id: string, data: FoodLogUpdateInput) {
  const existingLog = await db.query.foodLogs.findFirst({
    where: and(eq(foodLogs.id, id), eq(foodLogs.userId, userId)),
    columns: { logDate: true },
  });
  if (!existingLog) return null;

  const updateValues = {
    ...(data.logDate !== undefined ? { logDate: data.logDate } : {}),
    ...(data.mealType !== undefined ? { mealType: data.mealType } : {}),
    ...(data.foodName !== undefined ? { foodName: data.foodName } : {}),
    ...(data.servingDescription !== undefined ? { servingDescription: data.servingDescription } : {}),
    ...(data.calories !== undefined ? { calories: data.calories } : {}),
    ...(data.proteinG !== undefined ? { proteinG: data.proteinG.toFixed(2) } : {}),
    ...(data.carbsG !== undefined ? { carbsG: data.carbsG.toFixed(2) } : {}),
    ...(data.fatG !== undefined ? { fatG: data.fatG.toFixed(2) } : {}),
    ...(data.note !== undefined ? { note: data.note?.trim() || null } : {}),
    ...(data.tags !== undefined ? { tags: data.tags ?? [] } : {}),
    updatedAt: sql`now()`,
  };

  const [log] = await db
    .update(foodLogs)
    .set(updateValues)
    .where(and(eq(foodLogs.id, id), eq(foodLogs.userId, userId)))
    .returning();

  await recalculateDailySummary(userId, existingLog.logDate);
  if (log.logDate !== existingLog.logDate) {
    await recalculateDailySummary(userId, log.logDate);
  }

  return log;
}

export async function deleteFoodLog(userId: string, id: string) {
  const [deleted] = await db
    .delete(foodLogs)
    .where(and(eq(foodLogs.id, id), eq(foodLogs.userId, userId)))
    .returning({ logDate: foodLogs.logDate });

  if (!deleted) return null;

  await recalculateDailySummary(userId, deleted.logDate);
  return deleted;
}

export async function batchActionFoodLogs(
  userId: string,
  action: "delete" | "copy",
  ids: string[],
  targetDate?: string,
) {
  if (ids.length === 0) return { deletedCount: 0, copiedCount: 0 };

  const rows = await findOwnedFoodLogsByIds(userId, ids);
  if (rows.length === 0) return { deletedCount: 0, copiedCount: 0 };

  const affectedDates = new Set<string>(rows.map((row) => row.logDate));

  if (action === "delete") {
    await deleteFoodLogsByIds(userId, rows.map((row) => row.id));
    await Promise.all(Array.from(affectedDates).map((date) => recalculateDailySummary(userId, date)));
    return {
      deletedCount: rows.length,
      copiedCount: 0,
    };
  }

  if (action === "copy" && targetDate) {
    const copiedCount = await copyFoodLogsToDate(
      userId,
      rows as Array<{ userId: string; mealType: MealType; foodName: string; servingDescription: string; calories: number; proteinG: string; carbsG: string; fatG: string }>,
      targetDate,
    );
    if (copiedCount > 0) {
      affectedDates.add(targetDate);
    }
    await Promise.all(Array.from(affectedDates).map((date) => recalculateDailySummary(userId, date)));
    return {
      deletedCount: 0,
      copiedCount,
    };
  }

  return { deletedCount: 0, copiedCount: 0 };
}
