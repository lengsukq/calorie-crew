import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { userAiConfigs } from "@/lib/db/schema";

export interface UserAiConfigInput {
  baseUrl?: string | null;
  model?: string | null;
  apiKey?: string | null;
}

export interface UserAiConfigSummary {
  baseUrl: string | null;
  model: string | null;
  hasApiKey: boolean;
}

function normalizeOptionalText(value: string | null | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

export async function getUserAiConfig(userId: string): Promise<typeof userAiConfigs.$inferSelect | null> {
  const config = await db.query.userAiConfigs.findFirst({
    where: eq(userAiConfigs.userId, userId),
  });

  return config ?? null;
}

export async function getUserAiConfigSummary(userId: string): Promise<UserAiConfigSummary> {
  const config = await getUserAiConfig(userId);

  return {
    baseUrl: config?.baseUrl ?? null,
    model: config?.model ?? null,
    hasApiKey: Boolean(config?.apiKey),
  };
}

export async function upsertUserAiConfig(userId: string, input: UserAiConfigInput): Promise<boolean> {
  const updateData: Partial<typeof userAiConfigs.$inferInsert> = {};
  const baseUrl = normalizeOptionalText(input.baseUrl);
  const model = normalizeOptionalText(input.model);
  const apiKey = normalizeOptionalText(input.apiKey);

  if (baseUrl !== undefined) updateData.baseUrl = baseUrl;
  if (model !== undefined) updateData.model = model;
  if (apiKey !== undefined) updateData.apiKey = apiKey;
  if (Object.keys(updateData).length === 0) return false;

  await db.insert(userAiConfigs).values({
    userId,
    ...updateData,
  }).onConflictDoUpdate({
    target: userAiConfigs.userId,
    set: { ...updateData, updatedAt: sql`now()` },
  });

  return true;
}
