import { getSessionUserId } from "@/lib/auth/session";
import { jsonError } from "@/lib/http";
import { dateRangeQuerySchema, weightLogSchema } from "@/lib/validation/health-log";
import { getWeightLogs, upsertWeightLog } from "@/lib/services/weight-log.service";

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
    const logs = await getWeightLogs(userId, parsed.data.startDate, parsed.data.endDate);
    return Response.json({ logs });
  } catch {
    return jsonError("获取体重记录失败", 500);
  }
}

export async function POST(request: Request): Promise<Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("未登录", 401);

  const parsed = weightLogSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("体重记录格式不正确", 400);

  try {
    const log = await upsertWeightLog(
      userId,
      parsed.data.logDate,
      parsed.data.weightKg,
      parsed.data.note,
    );
    return Response.json({ log }, { status: 201 });
  } catch {
    return jsonError("保存体重记录失败", 500);
  }
}
