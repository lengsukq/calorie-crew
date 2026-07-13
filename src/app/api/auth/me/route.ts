import { requireSessionUserId, withRouteError } from "@/lib/api-route";
import { jsonError } from "@/lib/http";
import { getCurrentUser } from "@/lib/services/auth.service";

export async function GET(): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  return withRouteError(async () => {
    const user = await getCurrentUser(userIdOrError);
    if (!user) return jsonError("用户不存在", 401);
    return Response.json({ user });
  }, "获取当前用户失败");
}
