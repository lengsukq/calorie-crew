import { getSessionUserId } from "@/lib/auth/session";
import { jsonError } from "@/lib/http";
import { dismissAdvice } from "@/lib/services/ai-advice.service";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("未登录", 401);

  const { id } = await context.params;

  try {
    const updated = await dismissAdvice(userId, id);
    if (!updated) return jsonError("AI 建议不存在", 404);
    return Response.json({ success: true });
  } catch {
    return jsonError("屏蔽建议失败", 500);
  }
}