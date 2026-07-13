import { getSessionUserId } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { userAiConfigs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { jsonError } from "@/lib/http";
import { checkRateLimit } from "@/lib/rate-limit";
import { getEffectiveConfig, recognizeFood } from "@/lib/services/food-recognize.service";
import { z } from "zod";

const recognizeSchema = z.object({
  imageData: z.string().optional(),
  mimeType: z.string().optional(),
  description: z.string().max(500).optional(),
});

export async function POST(request: Request): Promise<Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("未登录", 401);

  if (!checkRateLimit(`ai:${userId}`, 10, 60_000)) {
    return jsonError("操作过于频繁，请稍后再试", 429);
  }

  const parsed = recognizeSchema.safeParse(await request.json());
  if (!parsed.success) {
    return jsonError("参数无效", 400);
  }

  const { imageData, mimeType, description } = parsed.data;

  if (!imageData && !description) {
    return jsonError("请提供图片或文字描述", 400);
  }

  // Get user's AI config, fallback to env vars
  const userConfig = await db.query.userAiConfigs.findFirst({
    where: eq(userAiConfigs.userId, userId),
  });

  const effectiveConfig = getEffectiveConfig(userConfig ?? null);
  if (!effectiveConfig) {
    return jsonError(
      "AI 识别未配置。请在「我的」页面设置 API 地址和密钥，或联系管理员配置系统环境变量。",
      400,
    );
  }

  try {
    const result = await recognizeFood(
      { imageBase64: imageData, mimeType, description },
      effectiveConfig,
    );
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "识别失败，请重试";
    return jsonError(message, 500);
  }
}
