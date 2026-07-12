import { clearSession } from "@/lib/auth/session";

export async function POST(): Promise<Response> {
  await clearSession();
  return Response.json({ ok: true });
}
