import { and, desc, eq, gte } from "drizzle-orm";
import { getSessionUserId } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { dailySummaries } from "@/lib/db/schema";
import { jsonError } from "@/lib/http";
import { addDays, todayDate } from "@/lib/date";
import { z } from "zod";

const historyQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(7),
});

export async function GET(request: Request): Promise<Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("未登录", 401);

  const daysParam = new URL(request.url).searchParams.get("days");
  const parsed = historyQuerySchema.safeParse({ days: daysParam ?? undefined });
  if (!parsed.success) return jsonError("历史查询参数不正确", 400);
  const { days } = parsed.data;

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
