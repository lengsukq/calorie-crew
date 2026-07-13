import { and, desc, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { dailySummaries, foodLogs } from "@/lib/db/schema";
import { addDays, todayDate } from "@/lib/date";

export async function getTodayDashboard(userId: string, date: string) {
  const [summary, logs] = await Promise.all([
    db.query.dailySummaries.findFirst({
      where: and(eq(dailySummaries.userId, userId), eq(dailySummaries.logDate, date)),
    }),
    db.query.foodLogs.findMany({
      where: and(eq(foodLogs.userId, userId), eq(foodLogs.logDate, date)),
    }),
  ]);

  return { summary: summary ?? null, logs };
}

export async function getHistoryDashboard(userId: string, days: number) {
  const since = addDays(todayDate(), -days);
  const summaries = await db.query.dailySummaries.findMany({
    where: and(eq(dailySummaries.userId, userId), gte(dailySummaries.logDate, since)),
    orderBy: [desc(dailySummaries.logDate)],
    columns: {
      logDate: true,
      targetKcal: true,
      totalKcal: true,
      totalExerciseKcal: true,
      netKcal: true,
      remainingKcal: true,
      totalProteinG: true,
      totalCarbsG: true,
      totalFatG: true,
    },
  });

  return { summaries, days };
}
