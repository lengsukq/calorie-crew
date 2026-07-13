import { parseJsonBody, requireSessionUserId, withRouteError } from "@/lib/api-route";
import { jsonError } from "@/lib/http";
import { getProfile, updateProfile } from "@/lib/services/profile.service";
import { profileUpdateSchema } from "@/lib/validation/profile";

export async function GET(): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  return withRouteError(async () => {
    const profileResponse = await getProfile(userIdOrError);
    return Response.json(profileResponse);
  }, "获取个人档案失败");
}

export async function PUT(request: Request): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const parsed = profileUpdateSchema.safeParse(await parseJsonBody(request));
  if (!parsed.success) return jsonError("个人档案格式不正确", 400);

  return withRouteError(async () => {
    const profileResponse = await updateProfile(userIdOrError, parsed.data);
    return Response.json(profileResponse);
  }, "保存个人档案失败");
}
