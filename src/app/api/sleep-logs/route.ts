import { parseDateRangeSearchParams, parseJsonBody, requireSessionUserId, withRouteError } from "@/lib/api-route";
import { jsonError } from "@/lib/http";
import { getSleepLogs, upsertSleepLog } from "@/lib/services/sleep-log.service";
import { sleepLogSchema } from "@/lib/validation/health-log";

export async function GET(request: Request): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const range = parseDateRangeSearchParams(request.url);
  if (!range.success) return range.response;

  return withRouteError(async () => {
    const logs = await getSleepLogs(userIdOrError, range.data.startDate, range.data.endDate);
    return Response.json({ logs });
  }, "获取睡眠记录失败");
}

export async function POST(request: Request): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const parsed = sleepLogSchema.safeParse(await parseJsonBody(request));
  if (!parsed.success) return jsonError("睡眠记录格式不正确", 400);

  return withRouteError(async () => {
    const log = await upsertSleepLog(
      userIdOrError,
      parsed.data.logDate,
      parsed.data.sleepMinutes,
      parsed.data.quality,
      parsed.data.note,
    );
    return Response.json({ log }, { status: 201 });
  }, "保存睡眠记录失败");
}
