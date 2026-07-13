import { getSessionUserId } from "@/lib/auth/session";
import { jsonError } from "@/lib/http";
import { checkRateLimit } from "@/lib/rate-limit";
import { generateAdvice } from "@/lib/services/ai-advice.service";
import { generateAdviceSchema } from "@/lib/validation/profile";

export async function POST(request: Request): Promise<Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("未登录", 401);

  if (!checkRateLimit(`ai:${userId}`, 10, 60_000)) {
    return jsonError("操作过于频繁，请稍后再试", 429);
  }

  const parsed = generateAdviceSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("生成建议参数不正确", 400);

  try {
    const advice = await generateAdvice(userId, parsed.data.type, parsed.data.force);
    return Response.json(advice);
  } catch {
    return jsonError("生成 AI 建议失败，请稍后再试", 500);
  }
}
