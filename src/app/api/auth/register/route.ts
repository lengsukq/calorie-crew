import { parseJsonBody, withRouteError } from "@/lib/api-route";
import { setSession } from "@/lib/auth/session";
import { jsonError } from "@/lib/http";
import { registerUser } from "@/lib/services/auth.service";
import { registerSchema } from "@/lib/validation/auth";

export async function POST(request: Request): Promise<Response> {
  const parsed = registerSchema.safeParse(await parseJsonBody(request));
  if (!parsed.success) return jsonError("邮箱或密码格式不正确", 400);

  return withRouteError(async () => {
    const result = await registerUser(parsed.data);
    if (!result.ok) return jsonError(result.message, result.status);

    await setSession(result.user.id);
    return Response.json({ user: result.user });
  }, "注册失败");
}
