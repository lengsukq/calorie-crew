import { requireSessionUserId, withRouteError } from "@/lib/api-route";
import { jsonError } from "@/lib/http";
import { deleteAdvice } from "@/lib/services/ai-advice.service";

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const { id } = await context.params;

  return withRouteError(async () => {
    const deleted = await deleteAdvice(userIdOrError, id);
    if (!deleted) return jsonError("AI 建议不存在", 404);
    return Response.json({ ok: true });
  }, "删除 AI 建议失败");
}
