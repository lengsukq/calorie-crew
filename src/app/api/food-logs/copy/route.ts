import { parseJsonBody, requireSessionUserId, withRouteError } from "@/lib/api-route";
import { jsonError } from "@/lib/http";
import { copyDayFoodLogs } from "@/lib/services/food-log.service";
import { localDateStringSchema } from "@/lib/validation/food-log";
import { z } from "zod";

const copyDaySchema = z.object({
  sourceDate: localDateStringSchema,
  targetDate: localDateStringSchema,
});

export async function POST(request: Request): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const parsed = copyDaySchema.safeParse(await parseJsonBody(request));
  if (!parsed.success) return jsonError("日期格式不正确", 400);

  return withRouteError(async () => {
    const copiedCount = await copyDayFoodLogs(userIdOrError, parsed.data.sourceDate, parsed.data.targetDate);
    return Response.json({ copiedCount });
  }, "复制餐食失败");
}
