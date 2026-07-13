import { getSessionUserId } from "@/lib/auth/session";
import { jsonError } from "@/lib/http";
import { generateAdvice } from "@/lib/services/ai-advice.service";
import { generateAdviceSchema } from "@/lib/validation/profile";

export async function POST(request: Request): Promise<Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("未登录", 401);

  const parsed = generateAdviceSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("生成建议参数不正确", 400);

  try {
    const advice = await generateAdvice(userId, parsed.data.type, parsed.data.force);
    return Response.json(advice);
  } catch (error) {
    const message = error instanceof Error ? error.message : "生成 AI 建议失败";
    const status = message.includes("暂无足够数据") || message.includes("已关闭") ? 400 : 500;
    return jsonError(message, status);
  }
}
