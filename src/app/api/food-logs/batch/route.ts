import { getSessionUserId } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { foodLogs } from "@/lib/db/schema";
import { jsonError } from "@/lib/http";
import { foodLogSchema } from "@/lib/validation/food-log";
import { recalculateDailySummary } from "@/lib/services/daily-summary.service";
import { z } from "zod";

const batchSchema = z.object({
  logs: z.array(foodLogSchema).min(1).max(50),
});

export async function POST(request: Request): Promise<Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("未登录", 401);

  const parsed = batchSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError("饮食记录格式不正确", 400);

  const logDate = parsed.data.logs[0].logDate;
  const allLogsAreSameDate = parsed.data.logs.every((log) => log.logDate === logDate);
  if (!allLogsAreSameDate) return jsonError("一次批量添加只能包含同一天的记录", 400);

  const values = parsed.data.logs.map((log) => ({
    userId,
    ...log,
    proteinG: log.proteinG.toFixed(2),
    carbsG: log.carbsG.toFixed(2),
    fatG: log.fatG.toFixed(2),
  }));

  const inserted = await db.insert(foodLogs).values(values).returning();

  // Recalculate summary once for all logs in the same date
  await recalculateDailySummary(userId, logDate);

  return Response.json({ logs: inserted }, { status: 201 });
}
