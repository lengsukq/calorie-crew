import { and, eq } from "drizzle-orm";
import { getSessionUserId } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { dailySummaries, foodLogs } from "@/lib/db/schema";
import { jsonError } from "@/lib/http";
import { todayDate } from "@/lib/date";
import { optionalDateQuerySchema } from "@/lib/validation/food-log";

export async function GET(request: Request): Promise<Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("未登录", 401);
  const query = optionalDateQuerySchema.safeParse({
    date: new URL(request.url).searchParams.get("date") ?? undefined,
  });
  if (!query.success) return jsonError("日期格式不正确", 400);

  const date = query.data.date ?? todayDate();
  const [summary, logs] = await Promise.all([
    db.query.dailySummaries.findFirst({ where: and(eq(dailySummaries.userId, userId), eq(dailySummaries.logDate, date)) }),
    db.query.foodLogs.findMany({ where: and(eq(foodLogs.userId, userId), eq(foodLogs.logDate, date)) }),
  ]);
  return Response.json({ summary: summary ?? null, logs });
}
