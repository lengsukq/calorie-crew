import { getSessionUserId } from "@/lib/auth/session";
import { jsonError } from "@/lib/http";
import { dateRangeQuerySchema } from "@/lib/validation/health-log";

export async function requireSessionUserId(): Promise<string | Response> {
  const userId = await getSessionUserId();
  if (!userId) return jsonError("未登录", 401);
  return userId;
}

export async function parseJsonBody(request: Request): Promise<unknown> {
  return request.json().catch(() => null);
}

export function parseDateRangeSearchParams(url: string):
  | { success: true; data: { startDate: string; endDate: string } }
  | { success: false; response: Response } {
  const searchParams = new URL(url).searchParams;
  const parsed = dateRangeQuerySchema.safeParse({
    startDate: searchParams.get("startDate") ?? undefined,
    endDate: searchParams.get("endDate") ?? undefined,
  });

  if (!parsed.success) {
    return { success: false, response: jsonError("日期范围格式不正确", 400) };
  }

  return { success: true, data: parsed.data };
}

/**
 * Run a route handler and map unexpected failures to a generic JSON error.
 * Logging stays diagnostic-only (error name/message), never secrets or stacks to clients.
 */
export async function withRouteError(
  handler: () => Promise<Response>,
  failureMessage: string,
  status = 500,
): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    const errorName = error instanceof Error ? error.name : "UnknownError";
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[api-route] ${failureMessage}`, { errorName, errorMessage });
    return jsonError(failureMessage, status);
  }
}
