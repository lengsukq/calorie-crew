import { getSessionUserId } from "@/lib/auth/session";
import { jsonError } from "@/lib/http";
import { dateRangeQuerySchema, exerciseLogSchema } from "@/lib/validation/health-log";
import { createExerciseLog, getExerciseLogs } from "@/lib/services/exercise-log.service";

export async function GET(request: Request): Promise<Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("未登录", 401);

  const searchParams = new URL(request.url).searchParams;
  const parsed = dateRangeQuerySchema.safeParse({
    startDate: searchParams.get("startDate") ?? undefined,
    endDate: searchParams.get("endDate") ?? undefined,
  });
  if (!parsed.success) return jsonError("日期范围格式不正确", 400);

  try {
    const logs = await getExerciseLogs(userId, parsed.data.startDate, parsed.data.endDate);
    return Response.json({ logs });
  } catch {
    return jsonError("获取运动记录失败", 500);
  }
}

export async function POST(request: Request): Promise<Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("未登录", 401);

  const parsed = exerciseLogSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("运动记录格式不正确", 400);

  try {
    const log = await createExerciseLog(
      userId,
      parsed.data.logDate,
      parsed.data.exerciseType,
      parsed.data.durationMinutes,
      parsed.data.caloriesBurned,
      parsed.data.note,
    );
    return Response.json({ log }, { status: 201 });
  } catch {
    return jsonError("保存运动记录失败", 500);
  }
}
