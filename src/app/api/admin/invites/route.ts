import { parseJsonBody, requireAdminUserId, withRouteError } from "@/lib/api-route";
import { jsonError } from "@/lib/http";
import { createInvite, listInvites } from "@/lib/services/invite.service";
import { z } from "zod";

const createInviteSchema = z.object({
  maxUses: z.number().int().min(1).max(1000),
  expiresAt: z.string().datetime().nullable().optional(),
});

export async function GET(): Promise<Response> {
  const userIdOrError = await requireAdminUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  return withRouteError(async () => {
    const invites = await listInvites(userIdOrError);
    return Response.json({ invites });
  }, "获取邀请码失败");
}

export async function POST(request: Request): Promise<Response> {
  const userIdOrError = await requireAdminUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  const parsed = createInviteSchema.safeParse(await parseJsonBody(request));
  if (!parsed.success) return jsonError("邀请码参数不正确", 400);

  return withRouteError(async () => {
    const invite = await createInvite(userIdOrError, parsed.data);
    return Response.json({ invite }, { status: 201 });
  }, "创建邀请码失败");
}
