import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { verifyPassword } from "@/lib/auth/password";
import { setSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validation/auth";
import { jsonError } from "@/lib/http";

export async function POST(request: Request): Promise<Response> {
  const parsed = loginSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError("邮箱或密码格式不正确", 400);

  const user = await db.query.users.findFirst({ where: eq(users.email, parsed.data.email) });
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return jsonError("邮箱或密码不正确", 401);
  }

  await setSession(user.id);
  return Response.json({ user: { id: user.id, email: user.email } });
}
