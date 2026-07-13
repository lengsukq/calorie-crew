import { getSessionUserId } from "@/lib/auth/session";
import { jsonError } from "@/lib/http";
import { dateRangeQuerySchema, bodyMeasurementSchema } from "@/lib/validation/health-log";
import { deleteBodyMeasurement, getBodyMeasurements, upsertBodyMeasurement } from "@/lib/services/food-log.service";

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
    const logs = await getBodyMeasurements(userId, parsed.data.startDate, parsed.data.endDate);
    return Response.json({ logs });
  } catch {
    return jsonError("获取围度记录失败", 500);
  }
}

export async function POST(request: Request): Promise<Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("未登录", 401);

  const parsed = bodyMeasurementSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("围度记录格式不正确", 400);

  try {
    const log = await upsertBodyMeasurement(userId, parsed.data.logDate, {
      chestCm: parsed.data.chestCm ?? null,
      waistCm: parsed.data.waistCm ?? null,
      hipCm: parsed.data.hipCm ?? null,
      armCm: parsed.data.armCm ?? null,
      legCm: parsed.data.legCm ?? null,
      note: parsed.data.note,
    });
    return Response.json({ log }, { status: 201 });
  } catch {
    return jsonError("保存围度记录失败", 500);
  }
}