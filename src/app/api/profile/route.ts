import { getSessionUserId } from "@/lib/auth/session";
import { jsonError } from "@/lib/http";
import { getProfile, updateProfile } from "@/lib/services/profile.service";
import { profileUpdateSchema } from "@/lib/validation/profile";

export async function GET(): Promise<Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("未登录", 401);

  try {
    const profileResponse = await getProfile(userId);
    return Response.json(profileResponse);
  } catch {
    return jsonError("获取个人档案失败", 500);
  }
}

export async function PUT(request: Request): Promise<Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("未登录", 401);

  const parsed = profileUpdateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("个人档案格式不正确", 400);

  try {
    const profileResponse = await updateProfile(userId, parsed.data);
    return Response.json(profileResponse);
  } catch {
    return jsonError("保存个人档案失败", 500);
  }
}
