import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { dailySummaries, foodLogs, users } from "@/lib/db/schema";

export async function recalculateDailySummary(userId: string, logDate: string): Promise<void> {
  const [user, logs] = await Promise.all([
    db.query.users.findFirst({ where: eq(users.id, userId), columns: { calorieTarget: true } }),
    db.query.foodLogs.findMany({ where: and(eq(foodLogs.userId, userId), eq(foodLogs.logDate, logDate)) }),
  ]);
  const totals = logs.reduce((sum, log) => ({
    calories: sum.calories + log.calories,
    proteinG: sum.proteinG + Number(log.proteinG),
    carbsG: sum.carbsG + Number(log.carbsG),
    fatG: sum.fatG + Number(log.fatG),
  }), { calories: 0, proteinG: 0, carbsG: 0, fatG: 0 });
  const targetKcal = user?.calorieTarget ?? 2000;

  await db.insert(dailySummaries).values({
    userId,
    logDate,
    targetKcal,
    totalKcal: totals.calories,
    remainingKcal: targetKcal - totals.calories,
    totalProteinG: totals.proteinG.toFixed(2),
    totalCarbsG: totals.carbsG.toFixed(2),
    totalFatG: totals.fatG.toFixed(2),
  }).onConflictDoUpdate({
    target: [dailySummaries.userId, dailySummaries.logDate],
    set: {
      targetKcal,
      totalKcal: totals.calories,
      remainingKcal: targetKcal - totals.calories,
      totalProteinG: totals.proteinG.toFixed(2),
      totalCarbsG: totals.carbsG.toFixed(2),
      totalFatG: totals.fatG.toFixed(2),
      updatedAt: sql`now()`,
    },
  });
}
