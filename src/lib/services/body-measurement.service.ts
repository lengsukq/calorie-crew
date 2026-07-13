import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { bodyMeasurements } from "@/lib/db/schema";
import { recalculateDailySummary } from "@/lib/services/daily-summary.service";

export interface BodyMeasurementWriteInput {
  chestCm?: number | null;
  waistCm?: number | null;
  hipCm?: number | null;
  armCm?: number | null;
  legCm?: number | null;
  note?: string | null;
}

function normalizeOptionalCentimeters(value?: number | null): string | null {
  if (value === undefined || value === null) return null;
  return Number(value.toFixed(2)).toFixed(2);
}

export async function getBodyMeasurements(userId: string, startDate: string, endDate: string) {
  return db.query.bodyMeasurements.findMany({
    where: and(
      eq(bodyMeasurements.userId, userId),
      gte(bodyMeasurements.logDate, startDate),
      lte(bodyMeasurements.logDate, endDate),
    ),
    orderBy: [bodyMeasurements.logDate, bodyMeasurements.createdAt],
  });
}

export async function upsertBodyMeasurement(userId: string, logDate: string, data: BodyMeasurementWriteInput) {
  const normalizedChestCm = normalizeOptionalCentimeters(data.chestCm);
  const normalizedWaistCm = normalizeOptionalCentimeters(data.waistCm);
  const normalizedHipCm = normalizeOptionalCentimeters(data.hipCm);
  const normalizedArmCm = normalizeOptionalCentimeters(data.armCm);
  const normalizedLegCm = normalizeOptionalCentimeters(data.legCm);
  const normalizedNote = data.note?.trim() ? data.note.trim() : null;

  const [log] = await db
    .insert(bodyMeasurements)
    .values({
      userId,
      logDate,
      chestCm: normalizedChestCm,
      waistCm: normalizedWaistCm,
      hipCm: normalizedHipCm,
      armCm: normalizedArmCm,
      legCm: normalizedLegCm,
      note: normalizedNote,
    })
    .onConflictDoUpdate({
      target: [bodyMeasurements.userId, bodyMeasurements.logDate],
      set: {
        chestCm: normalizedChestCm,
        waistCm: normalizedWaistCm,
        hipCm: normalizedHipCm,
        armCm: normalizedArmCm,
        legCm: normalizedLegCm,
        note: normalizedNote,
        updatedAt: sql`now()`,
      },
    })
    .returning();

  await recalculateDailySummary(userId, logDate);
  return log;
}

export async function deleteBodyMeasurement(userId: string, id: string) {
  const [deletedLog] = await db
    .delete(bodyMeasurements)
    .where(and(eq(bodyMeasurements.id, id), eq(bodyMeasurements.userId, userId)))
    .returning();

  return deletedLog ?? null;
}
