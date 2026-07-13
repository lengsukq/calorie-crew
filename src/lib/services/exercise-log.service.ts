import { and, asc, eq, gte, lte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { exerciseLogs } from "@/lib/db/schema";
import { recalculateDailySummary } from "@/lib/services/daily-summary.service";

export async function getExerciseLogs(userId: string, startDate: string, endDate: string) {
  return db.query.exerciseLogs.findMany({
    where: and(
      eq(exerciseLogs.userId, userId),
      gte(exerciseLogs.logDate, startDate),
      lte(exerciseLogs.logDate, endDate),
    ),
    orderBy: [asc(exerciseLogs.logDate), asc(exerciseLogs.createdAt)],
  });
}

export async function createExerciseLog(
  userId: string,
  logDate: string,
  exerciseType: string,
  durationMinutes: number,
  caloriesBurned: number,
  note?: string | null,
) {
  const [log] = await db
    .insert(exerciseLogs)
    .values({
      userId,
      logDate,
      exerciseType: exerciseType.trim(),
      durationMinutes,
      caloriesBurned,
      note: note?.trim() ? note.trim() : null,
    })
    .returning();

  await recalculateDailySummary(userId, log.logDate);
  return log;
}

export async function deleteExerciseLog(userId: string, id: string) {
  const [deletedLog] = await db
    .delete(exerciseLogs)
    .where(and(eq(exerciseLogs.id, id), eq(exerciseLogs.userId, userId)))
    .returning();

  if (!deletedLog) return null;

  await recalculateDailySummary(userId, deletedLog.logDate);
  return deletedLog;
}
