import { parseJsonBody, requireSessionUserId, withRouteError } from "@/lib/api-route";
import { jsonError } from "@/lib/http";
import { getUserAiConfigSummary, upsertUserAiConfig } from "@/lib/services/user-ai-config.service";
import { z } from "zod";

const updateSchema = z.object({
  baseUrl: z.string().url().nullable().optional().or(z.literal("")),
  model: z.string().optional().or(z.literal("")),
  apiKey: z.string().optional().or(z.literal("")),
});

export async function GET(): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  return withRouteError(async () => {
    const config = await getUserAiConfigSummary(userIdOrError);
    return Response.json(config);
  }, "获取 AI 配置失败");
}

export async function PUT(request: Request): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const parsed = updateSchema.safeParse(await parseJsonBody(request));
  if (!parsed.success) {
    return jsonError("参数格式不正确", 400);
  }

  return withRouteError(async () => {
    const updated = await upsertUserAiConfig(userIdOrError, parsed.data);
    if (!updated) return jsonError("没有需要更新的字段", 400);
    return Response.json({ success: true });
  }, "保存 AI 配置失败");
}
