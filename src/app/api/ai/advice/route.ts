import { getSessionUserId } from "@/lib/auth/session";
import { jsonError } from "@/lib/http";
import { getAdvices } from "@/lib/services/ai-advice.service";
import { adviceTypeQuerySchema } from "@/lib/validation/profile";

export async function GET(request: Request): Promise<Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("未登录", 401);

  const searchParams = new URL(request.url).searchParams;
  const parsed = adviceTypeQuerySchema.safeParse({
    type: searchParams.get("type") ?? undefined,
    range: searchParams.get("range") ?? undefined,
  });
  if (!parsed.success) return jsonError("建议查询参数不正确", 400);

  try {
    const advices = await getAdvices(userId, parsed.data.type, parsed.data.range);
    return Response.json({ advices });
  } catch {
    return jsonError("获取 AI 建议失败", 500);
  }
}
