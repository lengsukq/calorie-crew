import { getSessionUserId } from "@/lib/auth/session";
import { jsonError } from "@/lib/http";
import { deleteBodyMeasurement } from "@/lib/services/food-log.service";

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("未登录", 401);

  const { id } = await context.params;

  try {
    const deletedLog = await deleteBodyMeasurement(userId, id);
    if (!deletedLog) return jsonError("围度记录不存在", 404);
    return Response.json({ ok: true });
  } catch {
    return jsonError("删除围度记录失败", 500);
  }
}