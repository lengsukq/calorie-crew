import { and, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { sleepLogs } from "@/lib/db/schema";
import { recalculateDailySummary } from "@/lib/services/daily-summary.service";

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

  const [log] = await db
    .insert(sleepLogs)
    .values({
      userId,
      logDate,
      sleepMinutes,
      quality,
      note: normalizedNote,
    })
    .onConflictDoUpdate({
      target: [sleepLogs.userId, sleepLogs.logDate],
      set: {
        sleepMinutes,
        quality,
        note: normalizedNote,
        updatedAt: sql`now()`,
      },
    })
    .returning();

  await recalculateDailySummary(userId, logDate);
  return log;
}

export async function deleteSleepLog(userId: string, id: string) {
  const [deletedLog] = await db
    .delete(sleepLogs)
    .where(and(eq(sleepLogs.id, id), eq(sleepLogs.userId, userId)))
    .returning();

  return deletedLog ?? null;
}
