import { getSessionUserId } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { userAiConfigs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { jsonError } from "@/lib/http";
import { getEffectiveConfig, recognizeFood } from "@/lib/services/food-recognize.service";
import { z } from "zod";

const recognizeSchema = z.object({
  description: z.string().trim().min(1).max(500),
});

export async function POST(request: Request): Promise<Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("未登录", 401);

  const parsed = recognizeSchema.safeParse(await request.json());
  if (!parsed.success) {
    return jsonError("请输入食物描述", 400);
  }

  // Try user's AI config first
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
    const result = await recognizeFood(parsed.data.description, effectiveConfig);
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "AI 识别失败，请重试";
    return jsonError(message, 500);
  }
}
