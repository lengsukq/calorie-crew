import { parseJsonBody, requireSessionUserId, withRouteError } from "@/lib/api-route";
import { jsonError } from "@/lib/http";
import { feedbackAdvice } from "@/lib/services/ai-advice.service";
import { z } from "zod";

const feedbackSchema = z.object({
  feedback: z.enum(["helpful", "not_helpful"]),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const { id } = await context.params;
  const parsed = feedbackSchema.safeParse(await parseJsonBody(request));
  if (!parsed.success) return jsonError("反馈参数不正确", 400);

  return withRouteError(async () => {
    const updated = await feedbackAdvice(userIdOrError, id, parsed.data.feedback);
    if (!updated) return jsonError("AI 建议不存在", 404);
    return Response.json({ success: true });
  }, "提交反馈失败");
}
