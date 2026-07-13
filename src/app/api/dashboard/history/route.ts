import { requireSessionUserId, withRouteError } from "@/lib/api-route";
import { jsonError } from "@/lib/http";
import { getHistoryDashboard } from "@/lib/services/dashboard.service";
import { z } from "zod";

const historyQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(365).default(7),
});

export async function GET(request: Request): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const daysParam = new URL(request.url).searchParams.get("days");
  const parsed = historyQuerySchema.safeParse({ days: daysParam ?? undefined });
  if (!parsed.success) return jsonError("历史查询参数不正确", 400);

  return withRouteError(async () => {
    const dashboard = await getHistoryDashboard(userIdOrError, parsed.data.days);
    return Response.json(dashboard);
  }, "获取历史概览失败");
}
