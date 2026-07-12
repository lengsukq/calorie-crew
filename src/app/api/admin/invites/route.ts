import { desc, eq } from "drizzle-orm";
import { getSessionUserId } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { inviteCodes, users } from "@/lib/db/schema";
import { jsonError } from "@/lib/http";
import { z } from "zod";

const createInviteSchema = z.object({
  maxUses: z.number().int().min(1).max(1000),
  expiresAt: z.string().datetime().nullable().optional(),
});

function makeInviteCode(): string {
  return `CC-${crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`;
}

async function requireAdmin(): Promise<string | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const user = await db.query.users.findFirst({ where: eq(users.id, userId), columns: { role: true } });
  return user?.role === "admin" ? userId : null;
}

export async function GET(): Promise<Response> {
  const userId = await requireAdmin();
  if (!userId) return jsonError("无管理员权限", 403);
  const invites = await db.query.inviteCodes.findMany({ where: eq(inviteCodes.createdByUserId, userId), orderBy: [desc(inviteCodes.createdAt)] });
  return Response.json({ invites });
}

export async function POST(request: Request): Promise<Response> {
  const userId = await requireAdmin();
  if (!userId) return jsonError("无管理员权限", 403);
  const parsed = createInviteSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError("邀请码参数不正确", 400);
  const [invite] = await db.insert(inviteCodes).values({ code: makeInviteCode(), createdByUserId: userId, maxUses: parsed.data.maxUses, expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null }).returning();
  return Response.json({ invite }, { status: 201 });
}
