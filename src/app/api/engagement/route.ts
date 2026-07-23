import { requireSessionUserId, withRouteError } from "@/lib/api-route";
import { getEngagement } from "@/lib/services/engagement.service";

export async function GET(): Promise<Response> {
  const userIdOrError = await requireSessionUserId();
  if (userIdOrError instanceof Response) return userIdOrError;

  return withRouteError(async () => {
    const engagement = await getEngagement(userIdOrError);
    return Response.json(engagement);
  }, "加载成就数据失败");
}
