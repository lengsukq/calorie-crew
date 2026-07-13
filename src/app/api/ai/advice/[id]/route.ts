import { getSessionUserId } from "@/lib/auth/session";
import { jsonError } from "@/lib/http";
import { deleteAdvice } from "@/lib/services/ai-advice.service";

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("未登录", 401);

  const { id } = await context.params;

  try {
    const deleted = await deleteAdvice(userId, id);
    if (!deleted) return jsonError("AI 建议不存在", 404);
    return Response.json({ ok: true });
  } catch {
    return jsonError("删除 AI 建议失败", 500);
  }
}
