import { parseDateRangeSearchParams, parseJsonBody, requireSessionUserId, withRouteError } from "@/lib/api-route";
import { jsonError } from "@/lib/http";
import { getWeightLogs, upsertWeightLog } from "@/lib/services/weight-log.service";
import { weightLogSchema } from "@/lib/validation/health-log";

export async function GET(request: Request): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const range = parseDateRangeSearchParams(request.url);
  if (!range.success) return range.response;

  return withRouteError(async () => {
    const logs = await getWeightLogs(userIdOrError, range.data.startDate, range.data.endDate);
    return Response.json({ logs });
  }, "获取体重记录失败");
}

export async function POST(request: Request): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const parsed = weightLogSchema.safeParse(await parseJsonBody(request));
  if (!parsed.success) return jsonError("体重记录格式不正确", 400);

  return withRouteError(async () => {
    const log = await upsertWeightLog(
      userIdOrError,
      parsed.data.logDate,
      parsed.data.weightKg,
      parsed.data.note,
    );
    return Response.json({ log }, { status: 201 });
  }, "保存体重记录失败");
}
