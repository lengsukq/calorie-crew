import { getSessionUserId } from "@/lib/auth/session";
import { jsonError } from "@/lib/http";
import { feedbackAdvice } from "@/lib/services/ai-advice.service";
import { z } from "zod";

const feedbackSchema = z.object({
  feedback: z.enum(["helpful", "not_helpful"]),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("未登录", 401);

  const { id } = await context.params;
  const parsed = feedbackSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("反馈参数不正确", 400);

  try {
    const updated = await feedbackAdvice(userId, id, parsed.data.feedback);
    if (!updated) return jsonError("AI 建议不存在", 404);
    return Response.json({ success: true });
  } catch {
    return jsonError("提交反馈失败", 500);
  }
}