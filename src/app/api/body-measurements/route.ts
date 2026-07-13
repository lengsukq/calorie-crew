import { parseDateRangeSearchParams, parseJsonBody, requireSessionUserId, withRouteError } from "@/lib/api-route";
import { jsonError } from "@/lib/http";
import { getBodyMeasurements, upsertBodyMeasurement } from "@/lib/services/body-measurement.service";
import { bodyMeasurementSchema } from "@/lib/validation/health-log";

export async function GET(request: Request): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const range = parseDateRangeSearchParams(request.url);
  if (!range.success) return range.response;

  return withRouteError(async () => {
    const logs = await getBodyMeasurements(userIdOrError, range.data.startDate, range.data.endDate);
    return Response.json({ logs });
  }, "获取围度记录失败");
}

export async function POST(request: Request): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const parsed = bodyMeasurementSchema.safeParse(await parseJsonBody(request));
  if (!parsed.success) return jsonError("围度记录格式不正确", 400);

  return withRouteError(async () => {
    const log = await upsertBodyMeasurement(userIdOrError, parsed.data.logDate, {
      chestCm: parsed.data.chestCm ?? null,
      waistCm: parsed.data.waistCm ?? null,
      hipCm: parsed.data.hipCm ?? null,
      armCm: parsed.data.armCm ?? null,
      legCm: parsed.data.legCm ?? null,
      note: parsed.data.note,
    });
    return Response.json({ log }, { status: 201 });
  }, "保存围度记录失败");
}
