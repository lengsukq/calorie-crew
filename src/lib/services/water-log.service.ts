import { and, eq, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { waterLogs } from "@/lib/db/schema";
import { recalculateDailySummary } from "@/lib/services/daily-summary.service";

export async function getWaterLogs(userId: string, startDate: string, endDate: string) {
  return db.query.waterLogs.findMany({
    where: and(eq(waterLogs.userId, userId), gte(waterLogs.logDate, startDate), lte(waterLogs.logDate, endDate)),
    orderBy: [waterLogs.logDate, waterLogs.createdAt],
  });
}

export async function createWaterLog(userId: string, logDate: string, amountMl: number, note?: string | null) {
  const normalizedNote = note?.trim() ? note.trim() : null;

  const [log] = await db
    .insert(waterLogs)
    .values({
      userId,
      logDate,
      amountMl,
      note: normalizedNote,
    })
    .returning();

  await recalculateDailySummary(userId, logDate);
  return log;
}

export async function deleteWaterLog(userId: string, id: string) {
  const [deletedLog] = await db
    .delete(waterLogs)
    .where(and(eq(waterLogs.id, id), eq(waterLogs.userId, userId)))
    .returning();

  return deletedLog ?? null;
}
