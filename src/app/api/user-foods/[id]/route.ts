import { parseJsonBody, requireSessionUserId, withRouteError } from "@/lib/api-route";
import { jsonError } from "@/lib/http";
import { deleteUserFood, updateUserFood } from "@/lib/services/user-food.service";
import { userFoodUpdateSchema } from "@/lib/validation/user-food";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const { id } = await context.params;
  const parsed = userFoodUpdateSchema.safeParse(await parseJsonBody(request));
  if (!parsed.success) return jsonError("食物信息格式不正确", 400);

  return withRouteError(async () => {
    const food = await updateUserFood(userIdOrError, id, parsed.data);
    if (!food) return jsonError("食物不存在", 404);
    return Response.json({ food });
  }, "更新食物失败");
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const { id } = await context.params;
  return withRouteError(async () => {
    const deleted = await deleteUserFood(userIdOrError, id);
    if (!deleted) return jsonError("食物不存在", 404);
    return Response.json({ ok: true });
  }, "删除食物失败");
}
