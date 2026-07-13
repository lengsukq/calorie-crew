import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { bodyMeasurements, exerciseLogs, foodLogs, sleepLogs, waterLogs, weightLogs } from "@/lib/db/schema";
import { recalculateDailySummary } from "@/lib/services/daily-summary.service";

export async function batchActionFoodLogs(
  userId: string,
  action: "delete" | "copy",
  ids: string[],
  targetDate?: string,
) {
  if (ids.length === 0) return { deletedCount: 0, copiedCount: 0 };

  const rows = await db.query.foodLogs.findMany({
    where: and(eq(foodLogs.userId, userId), ...ids.map((id) => eq(foodLogs.id, id))),
    columns: {
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
    },
  });

  if (rows.length === 0) return { deletedCount: 0, copiedCount: 0 };

  const affectedDates = new Set<string>(rows.map((row) => row.logDate));

  if (action === "delete") {
    await db.delete(foodLogs).where(and(eq(foodLogs.userId, userId), ...ids.map((id) => eq(foodLogs.id, id))));
  }

  if (action === "copy" && targetDate) {
    const sourceIds = rows.map((row) => row.id);
    const existingTargetLogs = await db.query.foodLogs.findMany({
      where: and(eq(foodLogs.userId, userId), eq(foodLogs.logDate, targetDate)),
      columns: { mealType: true, foodName: true, servingDescription: true, calories: true, proteinG: true, carbsG: true, fatG: true },
    });
    const duplicateKeys = new Set(
      existingTargetLogs.map(
        (log) =>
          `${log.mealType}::${log.foodName}::${log.servingDescription}::${log.calories}::${log.proteinG}::${log.carbsG}::${log.fatG}`,
      ),
    );

    const values = rows
      .filter((row) => !duplicateKeys.has(`${row.mealType}::${row.foodName}::${row.servingDescription}::${row.calories}::${row.proteinG}::${row.carbsG}::${row.fatG}`))
      .map((row) => ({
        userId: row.userId,
        logDate: targetDate,
        mealType: row.mealType,
        foodName: row.foodName,
        servingDescription: row.servingDescription,
        calories: row.calories,
        proteinG: row.proteinG,
        carbsG: row.carbsG,
        fatG: row.fatG,
      }));

    if (values.length > 0) {
      await db.insert(foodLogs).values(values);
      affectedDates.add(targetDate);
    }
  }

  await Promise.all(Array.from(affectedDates).map((date) => recalculateDailySummary(userId, date)));

  return {
    deletedCount: action === "delete" ? rows.length : 0,
    copiedCount: action === "copy" ? rows.length : 0,
  };
}

export async function getWaterLogs(userId: string, startDate: string, endDate: string) {
  return db.query.waterLogs.findMany({
    where: and(eq(waterLogs.userId, userId), gte(waterLogs.logDate, startDate), lte(waterLogs.logDate, endDate)),
    orderBy: [waterLogs.logDate, waterLogs.createdAt],
  });
}

export async function createWaterLog(userId: string, logDate: string, amountMl: number, note?: string | null) {
  const normalizedNote = note?.trim() ? note.trim() : null;

  const [log] = await db.insert(waterLogs).values({
    userId,
    logDate,
    amountMl,
    note: normalizedNote,
  }).returning();

  return log;
}

export async function deleteWaterLog(userId: string, id: string) {
  const [deletedLog] = await db.delete(waterLogs).where(and(eq(waterLogs.id, id), eq(waterLogs.userId, userId))).returning();
  return deletedLog ?? null;
}

export async function getSleepLogs(userId: string, startDate: string, endDate: string) {
  return db.query.sleepLogs.findMany({
    where: and(eq(sleepLogs.userId, userId), gte(sleepLogs.logDate, startDate), lte(sleepLogs.logDate, endDate)),
    orderBy: [sleepLogs.logDate, sleepLogs.createdAt],
  });
}

export async function upsertSleepLog(
  userId: string,
  logDate: string,
  sleepMinutes: number,
  quality: number,
  note?: string | null,
) {
  const normalizedNote = note?.trim() ? note.trim() : null;

  const [log] = await db.insert(sleepLogs).values({
    userId,
    logDate,
    sleepMinutes,
    quality,
    note: normalizedNote,
  }).onConflictDoUpdate({
    target: [sleepLogs.userId, sleepLogs.logDate],
    set: {
      sleepMinutes,
      quality,
      note: normalizedNote,
      updatedAt: sql`now()`,
    },
  }).returning();

  return log;
}

export async function deleteSleepLog(userId: string, id: string) {
  const [deletedLog] = await db.delete(sleepLogs).where(and(eq(sleepLogs.id, id), eq(sleepLogs.userId, userId))).returning();
  return deletedLog ?? null;
}

export async function getBodyMeasurements(userId: string, startDate: string, endDate: string) {
  return db.query.bodyMeasurements.findMany({
    where: and(eq(bodyMeasurements.userId, userId), gte(bodyMeasurements.logDate, startDate), lte(bodyMeasurements.logDate, endDate)),
    orderBy: [bodyMeasurements.logDate, bodyMeasurements.createdAt],
  });
}

export async function upsertBodyMeasurement(
  userId: string,
  logDate: string,
  data: {
    chestCm?: number | null;
    waistCm?: number | null;
    hipCm?: number | null;
    armCm?: number | null;
    legCm?: number | null;
    note?: string | null;
  },
) {
  const normalizedChestCm = data.chestCm !== undefined && data.chestCm !== null ? Number(data.chestCm.toFixed(2)) : null;
  const normalizedWaistCm = data.waistCm !== undefined && data.waistCm !== null ? Number(data.waistCm.toFixed(2)) : null;
  const normalizedHipCm = data.hipCm !== undefined && data.hipCm !== null ? Number(data.hipCm.toFixed(2)) : null;
  const normalizedArmCm = data.armCm !== undefined && data.armCm !== null ? Number(data.armCm.toFixed(2)) : null;
  const normalizedLegCm = data.legCm !== undefined && data.legCm !== null ? Number(data.legCm.toFixed(2)) : null;
  const normalizedNote = data.note?.trim() ? data.note.trim() : null;

  const [log] = await db.insert(bodyMeasurements).values({
    userId,
    logDate,
    chestCm: normalizedChestCm?.toFixed(2) ?? null,
    waistCm: normalizedWaistCm?.toFixed(2) ?? null,
    hipCm: normalizedHipCm?.toFixed(2) ?? null,
    armCm: normalizedArmCm?.toFixed(2) ?? null,
    legCm: normalizedLegCm?.toFixed(2) ?? null,
    note: normalizedNote,
  }).onConflictDoUpdate({
    target: [bodyMeasurements.userId, bodyMeasurements.logDate],
    set: {
      chestCm: normalizedChestCm?.toFixed(2) ?? null,
      waistCm: normalizedWaistCm?.toFixed(2) ?? null,
      hipCm: normalizedHipCm?.toFixed(2) ?? null,
      armCm: normalizedArmCm?.toFixed(2) ?? null,
      legCm: normalizedLegCm?.toFixed(2) ?? null,
      note: normalizedNote,
      updatedAt: sql`now()`,
    },
  }).returning();

  return log;
}

export async function deleteBodyMeasurement(userId: string, id: string) {
  const [deletedLog] = await db.delete(bodyMeasurements).where(and(eq(bodyMeasurements.id, id), eq(bodyMeasurements.userId, userId))).returning();
  return deletedLog ?? null;
}
