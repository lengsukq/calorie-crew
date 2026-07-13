import { parseJsonBody, requireSessionUserId, withRouteError } from "@/lib/api-route";
import { jsonError } from "@/lib/http";
import { checkRateLimit } from "@/lib/rate-limit";
import { getEffectiveConfig, recognizeFood } from "@/lib/services/food-recognize.service";
import { getUserAiConfig } from "@/lib/services/user-ai-config.service";
import { z } from "zod";

const recognizeSchema = z.object({
  imageData: z.string().optional(),
  mimeType: z.string().optional(),
  description: z.string().max(500).optional(),
});

export async function POST(request: Request): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  if (!checkRateLimit(`ai:${userIdOrError}`, 10, 60_000)) {
    return jsonError("操作过于频繁，请稍后再试", 429);
  }

  const parsed = recognizeSchema.safeParse(await parseJsonBody(request));
  if (!parsed.success) {
    return jsonError("参数无效", 400);
  }

  const { imageData, mimeType, description } = parsed.data;

  if (!imageData && !description) {
    return jsonError("请提供图片或文字描述", 400);
  }

  const userConfig = await getUserAiConfig(userIdOrError);
  const effectiveConfig = getEffectiveConfig(userConfig ?? null);
  if (!effectiveConfig) {
    return jsonError(
      "AI 识别未配置。请在「我的」页面设置 API 地址和密钥，或联系管理员配置系统环境变量。",
      400,
    );
  }

  return withRouteError(async () => {
    const result = await recognizeFood(
      { imageBase64: imageData, mimeType, description },
      effectiveConfig,
    );
    return Response.json(result);
  }, "识别失败，请重试");
}
