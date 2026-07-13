import { parseDateRangeSearchParams, parseJsonBody, requireSessionUserId, withRouteError } from "@/lib/api-route";
import { jsonError } from "@/lib/http";
import { createExerciseLog, getExerciseLogs } from "@/lib/services/exercise-log.service";
import { exerciseLogSchema } from "@/lib/validation/health-log";

export async function GET(request: Request): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const range = parseDateRangeSearchParams(request.url);
  if (!range.success) return range.response;

  return withRouteError(async () => {
    const logs = await getExerciseLogs(userIdOrError, range.data.startDate, range.data.endDate);
    return Response.json({ logs });
  }, "获取运动记录失败");
}

export async function POST(request: Request): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const parsed = exerciseLogSchema.safeParse(await parseJsonBody(request));
  if (!parsed.success) return jsonError("运动记录格式不正确", 400);

  return withRouteError(async () => {
    const log = await createExerciseLog(
      userIdOrError,
      parsed.data.logDate,
      parsed.data.exerciseType,
      parsed.data.durationMinutes,
      parsed.data.caloriesBurned,
      parsed.data.note,
    );
    return Response.json({ log }, { status: 201 });
  }, "保存运动记录失败");
}
