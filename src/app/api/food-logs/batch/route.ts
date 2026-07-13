import { z } from "zod";
import { parseJsonBody, requireSessionUserId, withRouteError } from "@/lib/api-route";
import { jsonError } from "@/lib/http";
import { batchActionFoodLogs } from "@/lib/services/food-log.service";

const batchSchema = z.object({
  action: z.enum(["delete", "copy"]),
  ids: z.array(z.string().uuid()).min(1).max(50),
  targetDate: z.string().optional(),
});

export async function POST(request: Request): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const parsed = batchSchema.safeParse(await parseJsonBody(request));
  if (!parsed.success) return jsonError("批量操作参数不正确", 400);

  const { action, ids, targetDate } = parsed.data;
  if (action === "copy" && !targetDate) return jsonError("复制操作需要 targetDate", 400);

  return withRouteError(async () => {
    const result = await batchActionFoodLogs(userIdOrError, action, ids, targetDate);
    return Response.json({ success: true, ...result });
  }, "批量操作失败");
}
