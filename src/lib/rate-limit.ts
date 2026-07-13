/**
 * 进程内内存限流器。
 *
 * 注意：在 Vercel Edge / Neon Serverless 多实例部署下不生效（每个实例各自计数，限流形同虚设）。
 * 仅适用于单实例开发环境或低并发场景。
 * 生产部署建议迁移到 Upstash Redis 或数据库计数。
 */
const windows = new Map<string, number[]>();

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const timestamps = (windows.get(key) ?? []).filter((t) => now - t < windowMs);
  if (timestamps.length >= maxRequests) {
    windows.set(key, timestamps);
    return false;
  }
  timestamps.push(now);
  windows.set(key, timestamps);
  return true;
}
