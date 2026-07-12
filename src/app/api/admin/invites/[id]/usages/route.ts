import { and, asc, eq } from "drizzle-orm";
import { getSessionUserId } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { inviteCodes, inviteUsages, users } from "@/lib/db/schema";
import { jsonError } from "@/lib/http";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }): Promise<Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("未登录", 401);
  const admin = await db.query.users.findFirst({ where: eq(users.id, userId), columns: { role: true } });
  if (admin?.role !== "admin") return jsonError("无管理员权限", 403);
  const { id } = await context.params;
  const invite = await db.query.inviteCodes.findFirst({ where: and(eq(inviteCodes.id, id), eq(inviteCodes.createdByUserId, userId)) });
  if (!invite) return jsonError("邀请码不存在", 404);

  const usages = await db.query.inviteUsages.findMany({ where: eq(inviteUsages.inviteCodeId, id), orderBy: [asc(inviteUsages.usedAt)] });
  const invitedUsers = await Promise.all(usages.map(async (usage) => {
    const invitedUser = await db.query.users.findFirst({ where: eq(users.id, usage.invitedUserId), columns: { id: true, email: true, createdAt: true } });
    return { ...usage, invitedUser };
  }));
  return Response.json({ invite, usages: invitedUsers });
}
