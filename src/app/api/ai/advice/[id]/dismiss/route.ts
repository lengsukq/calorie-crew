import { requireSessionUserId, withRouteError } from "@/lib/api-route";
import { jsonError } from "@/lib/http";
import { dismissAdvice } from "@/lib/services/ai-advice.service";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const { id } = await context.params;

  return withRouteError(async () => {
    const updated = await dismissAdvice(userIdOrError, id);
    if (!updated) return jsonError("AI 建议不存在", 404);
    return Response.json({ success: true });
  }, "屏蔽建议失败");
}
