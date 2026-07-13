import { getSessionUserId } from "@/lib/auth/session";
import { jsonError } from "@/lib/http";
import { reactivateAdvice } from "@/lib/services/ai-advice.service";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("未登录", 401);

  const { id } = await context.params;

  try {
    const advice = await reactivateAdvice(userId, id);
    if (!advice) return jsonError("AI 建议不存在", 404);
    return Response.json({ advice });
  } catch {
    return jsonError("重新激活建议失败", 500);
  }
}