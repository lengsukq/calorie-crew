import { getSessionUserId } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { userAiConfigs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { jsonError } from "@/lib/http";
import { getEffectiveConfig, recognizeFood, recognizeFoodBoohee } from "@/lib/services/food-recognize.service";
import { env } from "@/lib/env";
import { z } from "zod";

const recognizeSchema = z.object({
  imageData: z.string().optional(),
  mimeType: z.string().optional(),
  engine: z.enum(["siliconflow", "boohee"]).default("siliconflow"),
  description: z.string().max(500).optional(),
});

export async function POST(request: Request): Promise<Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("未登录", 401);

  const parsed = recognizeSchema.safeParse(await request.json());
  if (!parsed.success) {
    return jsonError("参数无效", 400);
  }

  const { imageData, mimeType, engine, description } = parsed.data;

  if (!imageData && !description) {
    return jsonError("请提供图片或文字描述", 400);
  }

  // Get user's AI config (used by both engines for apiKey)
  const userConfig = await db.query.userAiConfigs.findFirst({
    where: eq(userAiConfigs.userId, userId),
  });

  try {
    if (engine === "boohee") {
      // ── Boohee mode ──────────────────────────
      if (!imageData) {
        return jsonError("Boohee 模式需要上传图片", 400);
      }

      const booheeKey = userConfig?.apiKey || env.BOOHEE_API_KEY;
      if (!booheeKey) {
        return jsonError(
          "Boohee API 密钥未配置。请在「我的」页面设置，或联系管理员配置系统环境变量。",
          400,
        );
      }

      const result = await recognizeFoodBoohee(imageData, booheeKey);
      return Response.json(result);
    } else {
      // ── SiliconFlow LLM mode ─────────────────
      if (!imageData && !description) {
        return jsonError("请提供图片或文字描述", 400);
      }

      const effectiveConfig = getEffectiveConfig(userConfig ?? null);
      if (!effectiveConfig) {
        return jsonError(
          "AI 识别未配置。请在「我的」页面设置 API 地址和密钥，或联系管理员配置系统环境变量。",
          400,
        );
      }

      const result = await recognizeFood(
        { imageBase64: imageData, mimeType, description },
        effectiveConfig,
      );
      return Response.json(result);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "识别失败，请重试";
    return jsonError(message, 500);
  }
}
