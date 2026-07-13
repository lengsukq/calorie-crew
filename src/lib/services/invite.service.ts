import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { inviteCodes, inviteUsages, users } from "@/lib/db/schema";

interface CreateInviteInput {
  maxUses: number;
  expiresAt?: string | null;
}

function makeInviteCode(): string {
  return `CC-${crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;
}

export async function listInvites(userId: string) {
  return db.query.inviteCodes.findMany({
    where: eq(inviteCodes.createdByUserId, userId),
    orderBy: [desc(inviteCodes.createdAt)],
  });
}

export async function createInvite(userId: string, input: CreateInviteInput) {
  const [invite] = await db.insert(inviteCodes).values({
    code: makeInviteCode(),
    createdByUserId: userId,
    maxUses: input.maxUses,
    expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
  }).returning();

  return invite;
}

export async function getInviteWithUsages(userId: string, inviteId: string) {
  const invite = await db.query.inviteCodes.findFirst({
    where: and(eq(inviteCodes.id, inviteId), eq(inviteCodes.createdByUserId, userId)),
  });
  if (!invite) return null;

  const usages = await db.query.inviteUsages.findMany({
    where: eq(inviteUsages.inviteCodeId, inviteId),
    orderBy: [asc(inviteUsages.usedAt)],
  });
  const invitedUserIds = usages.map((usage) => usage.invitedUserId);
  const invitedUsers = await findInvitedUsersByIds(invitedUserIds);

  return {
    invite,
    usages: usages.map((usage) => ({ ...usage, invitedUser: invitedUsers.get(usage.invitedUserId) ?? null })),
  };
}

async function findInvitedUsersByIds(invitedUserIds: string[]) {
  if (invitedUserIds.length === 0) return new Map<string, Pick<typeof users.$inferSelect, "id" | "email" | "createdAt">>();

  const rows = await db.query.users.findMany({
    where: inArray(users.id, invitedUserIds),
    columns: { id: true, email: true, createdAt: true },
  });

  return new Map(rows.map((user) => [user.id, user]));
}
