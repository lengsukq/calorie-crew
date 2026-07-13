import { and, eq, gt, isNull, or, sql } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { db } from "@/lib/db/client";
import { inviteCodes, inviteUsages, users } from "@/lib/db/schema";
import { env } from "@/lib/env";

export interface AuthenticatedUserData {
  id: string;
  email: string;
}

export interface CurrentUserData extends AuthenticatedUserData {
  role: string;
  calorieTarget: number;
}

interface RegisterUserInput {
  email: string;
  password: string;
  inviteCode: string;
}

type RegisterUserResult =
  | { ok: true; user: AuthenticatedUserData }
  | { ok: false; status: 403 | 409; message: string };

async function findValidInvite(inviteCode: string) {
  return db.query.inviteCodes.findFirst({
    where: and(
      eq(inviteCodes.code, inviteCode),
      or(isNull(inviteCodes.expiresAt), gt(inviteCodes.expiresAt, new Date())),
      gt(inviteCodes.maxUses, inviteCodes.usedCount),
    ),
  });
}

export async function validateLogin(email: string, password: string): Promise<AuthenticatedUserData | null> {
  const user = await db.query.users.findFirst({ where: eq(users.email, email) });
  if (!user || !(await verifyPassword(password, user.passwordHash))) return null;

  return { id: user.id, email: user.email };
}

export async function registerUser(input: RegisterUserInput): Promise<RegisterUserResult> {
  const existingUser = await db.query.users.findFirst({ where: eq(users.email, input.email) });
  if (existingUser) return { ok: false, status: 409, message: "该邮箱已注册" };

  const firstUser = await db.query.users.findFirst({ columns: { id: true } });
  const isFirstUser = !firstUser;
  let inviterUserId: string | null = null;
  let inviteCodeId: string | null = null;

  if (isFirstUser) {
    if (input.inviteCode !== env.INITIAL_INVITE_CODE) {
      return { ok: false, status: 403, message: "初始邀请码不正确" };
    }
  } else {
    const invite = await findValidInvite(input.inviteCode);
    if (!invite) return { ok: false, status: 403, message: "邀请码无效、已用完或已过期" };
    inviterUserId = invite.createdByUserId;
    inviteCodeId = invite.id;
  }

  const [user] = await db.insert(users).values({
    email: input.email,
    passwordHash: await hashPassword(input.password),
    role: isFirstUser ? "admin" : "member",
  }).returning({ id: users.id, email: users.email });

  if (inviteCodeId && inviterUserId) {
    await db.insert(inviteUsages).values({ inviteCodeId, inviterUserId, invitedUserId: user.id });
    await db.update(inviteCodes)
      .set({ usedCount: sql`${inviteCodes.usedCount} + 1` })
      .where(eq(inviteCodes.id, inviteCodeId));
  }

  return { ok: true, user };
}

export async function getCurrentUser(userId: string): Promise<CurrentUserData | null> {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    role: user.role,
    calorieTarget: user.calorieTarget,
  };
}

export async function isAdminUser(userId: string): Promise<boolean> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { role: true },
  });

  return user?.role === "admin";
}
