import { and, eq, sql } from "drizzle-orm";
import { getSessionUserId } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { foodLogs } from "@/lib/db/schema";
import { recalculateDailySummary } from "@/lib/services/daily-summary.service";
import { jsonError } from "@/lib/http";
import { foodLogUpdateSchema } from "@/lib/validation/food-log";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("未登录", 401);

  const { id } = await context.params;
  const parsed = foodLogUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("饮食记录格式不正确", 400);

  const existingLog = await db.query.foodLogs.findFirst({
    where: and(eq(foodLogs.id, id), eq(foodLogs.userId, userId)),
    columns: { logDate: true },
  });
  if (!existingLog) return jsonError("饮食记录不存在", 404);

  const updateValues = {
    ...(parsed.data.logDate !== undefined ? { logDate: parsed.data.logDate } : {}),
    ...(parsed.data.mealType !== undefined ? { mealType: parsed.data.mealType } : {}),
    ...(parsed.data.foodName !== undefined ? { foodName: parsed.data.foodName } : {}),
    ...(parsed.data.servingDescription !== undefined
      ? { servingDescription: parsed.data.servingDescription }
      : {}),
    ...(parsed.data.calories !== undefined ? { calories: parsed.data.calories } : {}),
    ...(parsed.data.proteinG !== undefined ? { proteinG: parsed.data.proteinG.toFixed(2) } : {}),
    ...(parsed.data.carbsG !== undefined ? { carbsG: parsed.data.carbsG.toFixed(2) } : {}),
    ...(parsed.data.fatG !== undefined ? { fatG: parsed.data.fatG.toFixed(2) } : {}),
    updatedAt: sql`now()`,
  };

  const [log] = await db
    .update(foodLogs)
    .set(updateValues)
    .where(and(eq(foodLogs.id, id), eq(foodLogs.userId, userId)))
    .returning();

  await recalculateDailySummary(userId, existingLog.logDate);
  if (log.logDate !== existingLog.logDate) {
    await recalculateDailySummary(userId, log.logDate);
  }

  return Response.json({ log });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("未登录", 401);
  const { id } = await context.params;
  const [deleted] = await db.delete(foodLogs).where(and(eq(foodLogs.id, id), eq(foodLogs.userId, userId))).returning({ logDate: foodLogs.logDate });
  if (!deleted) return jsonError("饮食记录不存在", 404);
  await recalculateDailySummary(userId, deleted.logDate);
  return Response.json({ ok: true });
}
