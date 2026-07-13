import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { dailySummaries, exerciseLogs, foodLogs, users } from "@/lib/db/schema";

export async function recalculateDailySummary(userId: string, logDate: string): Promise<void> {
  const [user, logs, exercises] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, userId), columns: { calorieTarget: true } }),
    db.query.foodLogs.findMany({ where: and(eq(foodLogs.userId, userId), eq(foodLogs.logDate, logDate)) }),
    db.query.exerciseLogs.findMany({
      where: and(eq(exerciseLogs.userId, userId), eq(exerciseLogs.logDate, logDate)),
    }),
  ]);
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
  const netKcal = totals.calories - totalExerciseKcal;
  const targetKcal = user?.calorieTarget ?? 2000;

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
      updatedAt: sql`now()`,
    },
  });
}
