import { and, asc, eq } from "drizzle-orm";
import { getSessionUserId } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { foodLogs } from "@/lib/db/schema";
import { jsonError } from "@/lib/http";
import { foodLogSchema } from "@/lib/validation/food-log";
import { recalculateDailySummary } from "@/lib/services/daily-summary.service";

export async function GET(request: Request): Promise<Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("未登录", 401);
  const date = new URL(request.url).searchParams.get("date");
  if (!date) return jsonError("缺少日期", 400);

  const logs = await db.query.foodLogs.findMany({
    where: and(eq(foodLogs.userId, userId), eq(foodLogs.logDate, date)),
    orderBy: [asc(foodLogs.createdAt)],
  });
  return Response.json({ logs });
}

export async function POST(request: Request): Promise<Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("未登录", 401);
  const parsed = foodLogSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError("饮食记录格式不正确", 400);

  const [log] = await db.insert(foodLogs).values({
    userId,
    ...parsed.data,
    proteinG: parsed.data.proteinG.toFixed(2),
    carbsG: parsed.data.carbsG.toFixed(2),
    fatG: parsed.data.fatG.toFixed(2),
  }).returning();
  await recalculateDailySummary(userId, log.logDate);
  return Response.json({ log }, { status: 201 });
}
