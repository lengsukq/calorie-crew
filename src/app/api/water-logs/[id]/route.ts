import { requireSessionUserId, withRouteError } from "@/lib/api-route";
import { jsonError } from "@/lib/http";
import { deleteWaterLog } from "@/lib/services/water-log.service";

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const { id } = await context.params;

  return withRouteError(async () => {
    const deletedLog = await deleteWaterLog(userIdOrError, id);
    if (!deletedLog) return jsonError("饮水记录不存在", 404);
    return Response.json({ ok: true });
  }, "删除饮水记录失败");
}
