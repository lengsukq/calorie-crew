import { getSessionUserId } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { userAiConfigs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { jsonError } from "@/lib/http";
import { z } from "zod";

const updateSchema = z.object({
  baseUrl: z.string().url().optional().or(z.literal("")),
  model: z.string().optional().or(z.literal("")),
  apiKey: z.string().optional().or(z.literal("")),
});

export async function GET(): Promise<Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("未登录", 401);

  const config = await db.query.userAiConfigs.findFirst({
    where: eq(userAiConfigs.userId, userId),
  });

  return Response.json({
    baseUrl: config?.baseUrl ?? null,
    model: config?.model ?? null,
    hasApiKey: Boolean(config?.apiKey),
  });
}

export async function PUT(request: Request): Promise<Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("未登录", 401);

  const parsed = updateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return jsonError("参数格式不正确", 400);
  }

  const { baseUrl, model, apiKey } = parsed.data;

  const updateData: Record<string, string | null> = {};
  if (baseUrl !== undefined) updateData.baseUrl = baseUrl || null;
  if (model !== undefined) updateData.model = model || null;
  if (apiKey !== undefined) updateData.apiKey = apiKey || null;

  if (Object.keys(updateData).length === 0) {
    return jsonError("没有需要更新的字段", 400);
  }

  const existing = await db.query.userAiConfigs.findFirst({
    where: eq(userAiConfigs.userId, userId),
  });

  if (existing) {
    await db
      .update(userAiConfigs)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(userAiConfigs.userId, userId));
  } else {
    await db.insert(userAiConfigs).values({
      userId,
      ...updateData,
    } as typeof userAiConfigs.$inferInsert);
  }

  return Response.json({ success: true });
}
