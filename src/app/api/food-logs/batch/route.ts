import { getSessionUserId } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { foodLogs } from "@/lib/db/schema";
import { jsonError } from "@/lib/http";
import { foodLogSchema } from "@/lib/validation/food-log";
import { recalculateDailySummary } from "@/lib/services/daily-summary.service";
import { batchActionFoodLogs } from "@/lib/services/food-log.service";
import { z } from "zod";

const batchSchema = z.object({
  action: z.enum(["delete", "copy"]),
  ids: z.array(z.string().uuid()).min(1).max(50),
  targetDate: z.string().optional(),
});

export async function POST(request: Request): Promise<Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("未登录", 401);

  const parsed = batchSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError("批量操作参数不正确", 400);

  const { action, ids, targetDate } = parsed.data;

  if (action === "copy" && !targetDate) return jsonError("复制操作需要 targetDate", 400);

  try {
    const result = await batchActionFoodLogs(userId, action, ids, targetDate);
    return Response.json({ success: true, ...result });
  } catch {
    return jsonError("批量操作失败", 500);
  }
}
