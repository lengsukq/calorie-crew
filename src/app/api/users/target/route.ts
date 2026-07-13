import { getSessionUserId } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { jsonError } from "@/lib/http";
import { z } from "zod";

const targetSchema = z.object({
  calorieTarget: z.number().int().min(500).max(10000).optional(),
  weightTargetKg: z.coerce.number().min(20).max(500).nullable().optional(),
}).refine(
  (value) => value.calorieTarget !== undefined || value.weightTargetKg !== undefined,
  "至少需要提供一个目标值",
);

export async function PUT(request: Request): Promise<Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("未登录", 401);

  const parsed = targetSchema.safeParse(await request.json());
  if (!parsed.success) {
    return jsonError("目标值无效（需在 500-10000 之间）", 400);
  }

  await db.update(users)
    .set({
      ...(parsed.data.calorieTarget !== undefined ? { calorieTarget: parsed.data.calorieTarget } : {}),
      ...(parsed.data.weightTargetKg !== undefined
        ? { weightTargetKg: parsed.data.weightTargetKg === null ? null : parsed.data.weightTargetKg.toFixed(2) }
        : {}),
    })
    .where(eq(users.id, userId));

  return Response.json({ success: true });
}
