import { requireSessionUserId, withRouteError } from "@/lib/api-route";
import { jsonError } from "@/lib/http";
import { getAdvices } from "@/lib/services/ai-advice.service";
import { adviceTypeQuerySchema } from "@/lib/validation/profile";

export async function GET(request: Request): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const searchParams = new URL(request.url).searchParams;
  const parsed = adviceTypeQuerySchema.safeParse({
    type: searchParams.get("type") ?? undefined,
    range: searchParams.get("range") ?? undefined,
  });
  if (!parsed.success) return jsonError("建议查询参数不正确", 400);

  return withRouteError(async () => {
    const advices = await getAdvices(userIdOrError, parsed.data.type, parsed.data.range);
    return Response.json({ advices });
  }, "获取 AI 建议失败");
}
