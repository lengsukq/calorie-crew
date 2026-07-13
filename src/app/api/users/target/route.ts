import { parseJsonBody, requireSessionUserId, withRouteError } from "@/lib/api-route";
import { jsonError } from "@/lib/http";
import { updateUserTarget } from "@/lib/services/profile.service";
import { z } from "zod";

const targetSchema = z.object({
  calorieTarget: z.number().int().min(500).max(10000).optional(),
  weightTargetKg: z.coerce.number().min(20).max(500).nullable().optional(),
}).refine(
  (value) => value.calorieTarget !== undefined || value.weightTargetKg !== undefined,
  "至少需要提供一个目标值",
);

export async function PUT(request: Request): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const parsed = targetSchema.safeParse(await parseJsonBody(request));
  if (!parsed.success) {
    return jsonError("目标值无效（需在 500-10000 之间）", 400);
  }

  return withRouteError(async () => {
    await updateUserTarget(userIdOrError, parsed.data);
    return Response.json({ success: true });
  }, "保存用户目标失败");
}
