import { and, desc, eq, gte } from "drizzle-orm";
import { getSessionUserId } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { dailySummaries } from "@/lib/db/schema";
import { jsonError } from "@/lib/http";
import { addDays, todayDate } from "@/lib/date";

export async function GET(request: Request): Promise<Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("未登录", 401);

  const daysParam = new URL(request.url).searchParams.get("days");
  const days = Math.min(Math.max(parseInt(daysParam ?? "7", 10) || 7, 1), 365);

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

  return Response.json({ summaries, days });
}
