import { parseJsonBody, requireSessionUserId } from "@/lib/api-route";
import { jsonError } from "@/lib/http";
import { createFoodLog, getFoodLogsByDate } from "@/lib/services/food-log.service";
import { foodLogSchema, requiredDateQuerySchema } from "@/lib/validation/food-log";

export async function GET(request: Request): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const query = requiredDateQuerySchema.safeParse({
    date: new URL(request.url).searchParams.get("date") ?? undefined,
  });
  if (!query.success) return jsonError("日期格式不正确", 400);

  const logs = await getFoodLogsByDate(userIdOrError, query.data.date);
  return Response.json({ logs });
}

export async function POST(request: Request): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const parsed = foodLogSchema.safeParse(await parseJsonBody(request));
  if (!parsed.success) return jsonError("饮食记录格式不正确", 400);

  const log = await createFoodLog(userIdOrError, parsed.data);
  return Response.json({ log }, { status: 201 });
}
