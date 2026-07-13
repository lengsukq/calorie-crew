import { parseJsonBody, requireSessionUserId } from "@/lib/api-route";
import { jsonError } from "@/lib/http";
import { deleteFoodLog, updateFoodLog } from "@/lib/services/food-log.service";
import { foodLogUpdateSchema } from "@/lib/validation/food-log";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const { id } = await context.params;
  const parsed = foodLogUpdateSchema.safeParse(await parseJsonBody(request));
  if (!parsed.success) return jsonError("饮食记录格式不正确", 400);

  const log = await updateFoodLog(userIdOrError, id, parsed.data);
  if (!log) return jsonError("饮食记录不存在", 404);

  return Response.json({ log });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const { id } = await context.params;
  const deleted = await deleteFoodLog(userIdOrError, id);
  if (!deleted) return jsonError("饮食记录不存在", 404);

  return Response.json({ ok: true });
}
