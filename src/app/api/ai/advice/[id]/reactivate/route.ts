import { requireSessionUserId, withRouteError } from "@/lib/api-route";
import { jsonError } from "@/lib/http";
import { reactivateAdvice } from "@/lib/services/ai-advice.service";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const { id } = await context.params;

  return withRouteError(async () => {
    const advice = await reactivateAdvice(userIdOrError, id);
    if (!advice) return jsonError("AI 建议不存在", 404);
    return Response.json({ advice });
  }, "重新激活建议失败");
}
