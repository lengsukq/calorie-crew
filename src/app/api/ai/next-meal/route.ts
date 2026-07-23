import { requireSessionUserId, withRouteError } from "@/lib/api-route";
import { jsonError } from "@/lib/http";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateNextMealSuggestion } from "@/lib/services/ai-advice.service";

export async function POST(): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  if (!checkRateLimit(`ai:${userIdOrError}`, 10, 60_000)) {
    return jsonError("操作过于频繁，请稍后再试", 429);
  }

  return withRouteError(async () => {
    const suggestion = await generateNextMealSuggestion(userIdOrError);
    return Response.json(suggestion);
  }, "生成下一餐建议失败，请稍后再试");
}
