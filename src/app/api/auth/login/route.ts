import { parseJsonBody, withRouteError } from "@/lib/api-route";
import { setSession } from "@/lib/auth/session";
import { jsonError } from "@/lib/http";
import { validateLogin } from "@/lib/services/auth.service";
import { loginSchema } from "@/lib/validation/auth";

export async function POST(request: Request): Promise<Response> {
  const parsed = loginSchema.safeParse(await parseJsonBody(request));
  if (!parsed.success) return jsonError("邮箱或密码格式不正确", 400);

  return withRouteError(async () => {
    const user = await validateLogin(parsed.data.email, parsed.data.password);
    if (!user) return jsonError("邮箱或密码不正确", 401);

    await setSession(user.id);
    return Response.json({ user });
  }, "登录失败");
}
