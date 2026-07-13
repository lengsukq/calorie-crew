import { and, asc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { weightLogs } from "@/lib/db/schema";

export async function getWeightLogs(userId: string, startDate: string, endDate: string) {
  return db.query.weightLogs.findMany({
    where: and(
      eq(weightLogs.userId, userId),
      gte(weightLogs.logDate, startDate),
      lte(weightLogs.logDate, endDate),
    ),
    orderBy: [asc(weightLogs.logDate), asc(weightLogs.createdAt)],
  });
}

export async function upsertWeightLog(
  userId: string,
  logDate: string,
  weightKg: number,
  note?: string | null,
) {
  const normalizedWeightKg = weightKg.toFixed(2);
  const normalizedNote = note?.trim() ? note.trim() : null;

  const [log] = await db
    .insert(weightLogs)
    .values({
      userId,
      logDate,
      weightKg: normalizedWeightKg,
      note: normalizedNote,
    })
    .onConflictDoUpdate({
      target: [weightLogs.userId, weightLogs.logDate],
      set: {
        weightKg: normalizedWeightKg,
        note: normalizedNote,
        updatedAt: sql`now()`,
      },
    })
    .returning();

  return log;
}

export async function deleteWeightLog(userId: string, id: string) {
  const [deletedLog] = await db
    .delete(weightLogs)
    .where(and(eq(weightLogs.id, id), eq(weightLogs.userId, userId)))
    .returning();

  return deletedLog ?? null;
}
