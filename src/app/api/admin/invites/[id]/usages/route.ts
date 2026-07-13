import { requireAdminUserId, withRouteError } from "@/lib/api-route";
import { jsonError } from "@/lib/http";
import { getInviteWithUsages } from "@/lib/services/invite.service";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const userIdOrError = await requireAdminUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const { id } = await context.params;

  return withRouteError(async () => {
    const result = await getInviteWithUsages(userIdOrError, id);
    if (!result) return jsonError("邀请码不存在", 404);
    return Response.json(result);
  }, "获取邀请码使用记录失败");
}
