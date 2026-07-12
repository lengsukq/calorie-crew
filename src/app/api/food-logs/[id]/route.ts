import { and, eq } from "drizzle-orm";
import { getSessionUserId } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { foodLogs } from "@/lib/db/schema";
import { recalculateDailySummary } from "@/lib/services/daily-summary.service";
import { jsonError } from "@/lib/http";

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("未登录", 401);
  const { id } = await context.params;
  const [deleted] = await db.delete(foodLogs).where(and(eq(foodLogs.id, id), eq(foodLogs.userId, userId))).returning({ logDate: foodLogs.logDate });
  if (!deleted) return jsonError("饮食记录不存在", 404);
  await recalculateDailySummary(userId, deleted.logDate);
  return Response.json({ ok: true });
}
