import { parseJsonBody, requireSessionUserId, withRouteError } from "@/lib/api-route";
import { jsonError } from "@/lib/http";
import { createUserFood, listUserFoods } from "@/lib/services/user-food.service";
import { userFoodSchema } from "@/lib/validation/user-food";

export async function GET(): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  return withRouteError(async () => {
    const foods = await listUserFoods(userIdOrError);
    return Response.json({ foods });
  }, "加载个人食物库失败");
}

export async function POST(request: Request): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const parsed = userFoodSchema.safeParse(await parseJsonBody(request));
  if (!parsed.success) return jsonError("食物信息格式不正确", 400);

  return withRouteError(async () => {
    const food = await createUserFood(userIdOrError, parsed.data);
    return Response.json({ food }, { status: 201 });
  }, "保存食物失败");
}
