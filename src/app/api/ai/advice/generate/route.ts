import { parseJsonBody, requireSessionUserId, withRouteError } from "@/lib/api-route";
import { jsonError } from "@/lib/http";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateAdvice } from "@/lib/services/ai-advice.service";
import { generateAdviceSchema } from "@/lib/validation/profile";

export async function POST(request: Request): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  if (!checkRateLimit(`ai:${userIdOrError}`, 10, 60_000)) {
    return jsonError("操作过于频繁，请稍后再试", 429);
  }

  const parsed = generateAdviceSchema.safeParse(await parseJsonBody(request));
  if (!parsed.success) return jsonError("生成建议参数不正确", 400);

  return withRouteError(async () => {
    const advice = await generateAdvice(userIdOrError, parsed.data.type, parsed.data.force);
    return Response.json(advice);
  }, "生成 AI 建议失败，请稍后再试");
}
