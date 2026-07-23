import { requireSessionUserId, withRouteError } from "@/lib/api-route";
import { jsonError } from "@/lib/http";
import { incrementUserFoodUsage } from "@/lib/services/user-food.service";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const { id } = await context.params;
  return withRouteError(async () => {
    const food = await incrementUserFoodUsage(userIdOrError, id);
    if (!food) return jsonError("食物不存在", 404);
    return Response.json({ food });
  }, "更新食物使用次数失败");
}
