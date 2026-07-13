import { requireSessionUserId, withRouteError } from "@/lib/api-route";
import { jsonError } from "@/lib/http";
import { deleteWeightLog } from "@/lib/services/weight-log.service";

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const { id } = await context.params;

  return withRouteError(async () => {
    const deletedLog = await deleteWeightLog(userIdOrError, id);
    if (!deletedLog) return jsonError("体重记录不存在", 404);
    return Response.json({ ok: true });
  }, "删除体重记录失败");
}
