import { and, eq, gt, isNull, lt, or, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { inviteCodes, inviteUsages, users } from "@/lib/db/schema";
import { hashPassword } from "@/lib/auth/password";
import { setSession } from "@/lib/auth/session";
import { registerSchema } from "@/lib/validation/auth";
import { jsonError } from "@/lib/http";
import { env } from "@/lib/env";

export async function POST(request: Request): Promise<Response> {
  const parsed = registerSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError("邮箱或密码格式不正确", 400);

  const existingUser = await db.query.users.findFirst({ where: eq(users.email, parsed.data.email) });
  if (existingUser) return jsonError("该邮箱已注册", 409);

  const firstUser = await db.query.users.findFirst({ columns: { id: true } });
  const isFirstUser = !firstUser;
  let inviterUserId: string | null = null;
  let inviteCodeId: string | null = null;
  if (isFirstUser) {
    if (parsed.data.inviteCode !== env.INITIAL_INVITE_CODE) return jsonError("初始邀请码不正确", 403);
  } else {
    const invite = await db.query.inviteCodes.findFirst({ where: and(eq(inviteCodes.code, parsed.data.inviteCode), or(isNull(inviteCodes.expiresAt), gt(inviteCodes.expiresAt, new Date())), gt(inviteCodes.maxUses, inviteCodes.usedCount)) });
    if (!invite) return jsonError("邀请码无效、已用完或已过期", 403);
    inviterUserId = invite.createdByUserId;
    inviteCodeId = invite.id;
  }

  const [user] = await db.insert(users).values({
    email: parsed.data.email,
    passwordHash: await hashPassword(parsed.data.password),
    role: isFirstUser ? "admin" : "member",
  }).returning({ id: users.id, email: users.email });

  if (inviteCodeId && inviterUserId) {
    await db.insert(inviteUsages).values({ inviteCodeId, inviterUserId, invitedUserId: user.id });
    await db.update(inviteCodes).set({ usedCount: sql`${inviteCodes.usedCount} + 1` }).where(eq(inviteCodes.id, inviteCodeId));
  }

  await setSession(user.id);
  return Response.json({ user });
}
