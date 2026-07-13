import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { dailySummaries, exerciseLogs, foodLogs, sleepLogs, users, waterLogs } from "@/lib/db/schema";

export async function recalculateDailySummary(userId: string, logDate: string): Promise<void> {
  const [user, logs, exercises, waterEntries, sleepEntries] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, userId), columns: { calorieTarget: true } }),
    db.query.foodLogs.findMany({ where: and(eq(foodLogs.userId, userId), eq(foodLogs.logDate, logDate)) }),
    db.query.exerciseLogs.findMany({
      where: and(eq(exerciseLogs.userId, userId), eq(exerciseLogs.logDate, logDate)),
    }),
    db.query.waterLogs.findMany({
      where: and(eq(waterLogs.userId, userId), eq(waterLogs.logDate, logDate)),
      columns: { amountMl: true },
    }),
    db.query.sleepLogs.findMany({
      where: and(eq(sleepLogs.userId, userId), eq(sleepLogs.logDate, logDate)),
      columns: { sleepMinutes: true },
    }),
  ]);

  if (!user) return;

  const totals = logs.reduce((sum, log) => ({
    calories: sum.calories + log.calories,
    proteinG: sum.proteinG + Number(log.proteinG),
    carbsG: sum.carbsG + Number(log.carbsG),
    fatG: sum.fatG + Number(log.fatG),
  }), { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 });
  const totalExerciseKcal = exercises.reduce(
    (sum, exercise) => sum + exercise.caloriesBurned,
    0,
  );
  const totalWaterMl = waterEntries.reduce((sum, entry) => sum + entry.amountMl, 0);
  const sleepMinutes = sleepEntries.reduce((sum, entry) => sum + entry.sleepMinutes, 0);
  const netKcal = totals.calories - totalExerciseKcal;
  const targetKcal = user.calorieTarget;

  await db.insert(dailySummaries).values({
    userId,
    logDate,
    targetKcal,
    totalKcal: totals.calories,
    totalExerciseKcal,
    netKcal,
    remainingKcal: targetKcal - netKcal,
    totalProteinG: totals.proteinG.toFixed(2),
    totalCarbsG: totals.carbsG.toFixed(2),
    totalFatG: totals.fatG.toFixed(2),
    totalWaterMl,
    sleepMinutes,
  }).onConflictDoUpdate({
    target: [dailySummaries.userId, dailySummaries.logDate],
    set: {
      targetKcal,
      totalKcal: totals.calories,
      totalExerciseKcal,
      netKcal,
      remainingKcal: targetKcal - netKcal,
      totalProteinG: totals.proteinG.toFixed(2),
      totalCarbsG: totals.carbsG.toFixed(2),
      totalFatG: totals.fatG.toFixed(2),
      totalWaterMl,
      sleepMinutes,
      updatedAt: sql`now()`,
    },
  });
}
