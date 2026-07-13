import { requireSessionUserId, withRouteError } from "@/lib/api-route";
import { jsonError } from "@/lib/http";
import { todayDate } from "@/lib/date";
import { getTodayDashboard } from "@/lib/services/dashboard.service";
import { optionalDateQuerySchema } from "@/lib/validation/food-log";

export async function GET(request: Request): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const query = optionalDateQuerySchema.safeParse({
    date: new URL(request.url).searchParams.get("date") ?? undefined,
  });
  if (!query.success) return jsonError("日期格式不正确", 400);

  const date = query.data.date ?? todayDate();
  return withRouteError(async () => {
    const dashboard = await getTodayDashboard(userIdOrError, date);
    return Response.json(dashboard);
  }, "获取今日概览失败");
}
