import { requireSessionUserId, withRouteError } from "@/lib/api-route";
import { jsonError } from "@/lib/http";
import { deleteExerciseLog } from "@/lib/services/exercise-log.service";

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const { id } = await context.params;

  return withRouteError(async () => {
    const deletedLog = await deleteExerciseLog(userIdOrError, id);
    if (!deletedLog) return jsonError("运动记录不存在", 404);
    return Response.json({ ok: true });
  }, "删除运动记录失败");
}
