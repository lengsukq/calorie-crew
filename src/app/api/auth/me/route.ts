import { eq } from "drizzle-orm";
import { getSessionUserId } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { users } from "@/lib/db/schema";
import { jsonError } from "@/lib/http";

export async function GET(): Promise<Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("未登录", 401);

  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) return jsonError("用户不存在", 401);
  return Response.json({ user: { id: user.id, email: user.email, role: user.role, calorieTarget: user.calorieTarget } });
}
