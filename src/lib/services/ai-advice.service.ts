import { and, desc, eq, gte, gt } from "drizzle-orm";
import { AI_ADVICE_PROMPTS } from "@/lib/constants/ai-advice-prompts";
import { db } from "@/lib/db/client";
import {
  aiAdvices,
  dailySummaries,
  exerciseLogs,
  userAiConfigs,
  weightLogs,
  type AiAdviceSuggestion,
  type AiAdviceType,
} from "@/lib/db/schema";
import { addDays, todayDate } from "@/lib/date";
import { getEffectiveConfig } from "@/lib/services/food-recognize.service";
import { getProfile } from "@/lib/services/profile.service";
import type { AiAdviceData } from "@/shared/types";

interface SanitizedAdvicePayload {
  summary: string;
  suggestions: AiAdviceSuggestion[];
}

interface RecentAdviceData {
  summaries: Array<typeof dailySummaries.$inferSelect>;
  weights: Array<typeof weightLogs.$inferSelect>;
  exercises: Array<typeof exerciseLogs.$inferSelect>;
}

const UNSAFE_CONTENT_PATTERNS = [
  "诊断",
  "治疗",
  "处方",
  "必须吃",
  "只能吃",
  "禁止吃",
  "快速减肥",
  "极端节食",
  "替代药物治疗",
];

function mapAdviceRow(row: typeof aiAdvices.$inferSelect): AiAdviceData {
  return {
    id: row.id,
    type: row.type,
    summary: row.summary,
    suggestions: row.suggestions,
    generatedAt: row.createdAt.toISOString(),
    expiresAt: row.expiresAt.toISOString(),
    readAt: row.readAt?.toISOString() ?? null,
    feedback: row.feedback ?? null,
    feedbackAt: row.feedbackAt?.toISOString() ?? null,
    completedAt: row.completedAt?.toISOString() ?? null,
    dismissed: row.dismissed,
    dismissedAt: row.dismissedAt?.toISOString() ?? null,
  };
}

function getRangeStartDate(range: "7d" | "30d" | "90d"): Date {
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

function getAdviceExpiration(type: AiAdviceType): Date {
  const hoursToLive = type === "weekly_summary" ? 7 * 24 : 24;
  return new Date(Date.now() + hoursToLive * 60 * 60 * 1000);
}

function fallbackAdvicePayload(message = "建议暂时不可用，请稍后重试。"): SanitizedAdvicePayload {
  return {
    summary: message,
    suggestions: [
      {
        title: "保持记录",
        detail: "继续记录饮食、运动和体重数据，数据越完整，后续建议会越贴近你的目标。",
        priority: "low",
      },
    ],
  };
}

function containsUnsafeContent(text: string): boolean {
  return UNSAFE_CONTENT_PATTERNS.some((pattern) => text.includes(pattern));
}

function extractJson(text: string): string | null {
  const blockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (blockMatch) return blockMatch[1].trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : null;
}

function normalizePriority(value: unknown): AiAdviceSuggestion["priority"] {
  if (value === "high" || value === "medium" || value === "low") return value;
  return "medium";
}

function sanitizeAdvice(rawContent: string): SanitizedAdvicePayload {
  const jsonText = extractJson(rawContent);
  if (!jsonText) return fallbackAdvicePayload();

  try {
    const parsed = JSON.parse(jsonText) as { summary?: unknown; suggestions?: unknown };
    const rawSuggestions = Array.isArray(parsed.suggestions) ? parsed.suggestions : [];
    const suggestions = rawSuggestions
      .map((item): AiAdviceSuggestion | null => {
        if (!item || typeof item !== "object") return null;
        const record = item as Record<string, unknown>;
        const title = String(record.title ?? "").trim();
        const detail = String(record.detail ?? "").trim();
        if (!title || !detail) return null;
        if (containsUnsafeContent(`${title} ${detail}`)) return null;
        return { title, detail, priority: normalizePriority(record.priority) };
      })
      .filter((item): item is AiAdviceSuggestion => item !== null)
      .slice(0, 3);

    const summary = String(parsed.summary ?? "").trim();
    if (!summary || suggestions.length === 0 || containsUnsafeContent(summary)) {
      return fallbackAdvicePayload();
    }

    return { summary, suggestions };
  } catch {
    return fallbackAdvicePayload();
  }
}

async function getRecentAdviceData(userId: string): Promise<RecentAdviceData> {
  const recentStartDate = addDays(todayDate(), -29);

  const [summaries, weights, exercises] = await Promise.all([
    db.query.dailySummaries.findMany({
      where: and(eq(dailySummaries.userId, userId), gte(dailySummaries.logDate, recentStartDate)),
      orderBy: [desc(dailySummaries.logDate)],
    }),
    db.query.weightLogs.findMany({
      where: and(eq(weightLogs.userId, userId), gte(weightLogs.logDate, recentStartDate)),
      orderBy: [desc(weightLogs.logDate)],
    }),
    db.query.exerciseLogs.findMany({
      where: and(eq(exerciseLogs.userId, userId), gte(exerciseLogs.logDate, recentStartDate)),
      orderBy: [desc(exerciseLogs.logDate)],
    }),
  ]);

  return { summaries, weights, exercises };
}

function buildUserContext(
  profileResponse: Awaited<ReturnType<typeof getProfile>>,
  recentData: RecentAdviceData,
  type: AiAdviceType,
): string {
  const { profile, metrics } = profileResponse;
  const latestSummary = recentData.summaries[0];
  const lastSevenSummaries = recentData.summaries.slice(0, 7);
  const averageKcal = lastSevenSummaries.length > 0
    ? Math.round(lastSevenSummaries.reduce((sum, item) => sum + item.totalKcal, 0) / lastSevenSummaries.length)
    : 0;
  const exerciseCount = recentData.exercises.filter((item) => item.logDate >= addDays(todayDate(), -6)).length;
  const totalExerciseKcal = recentData.exercises.reduce((sum, item) => sum + item.caloriesBurned, 0);
  const latestWeight = recentData.weights[0]?.weightKg ?? metrics.currentWeightKg ?? "未记录";
  const oldestWeight = recentData.weights[recentData.weights.length - 1]?.weightKg ?? null;
  const weightChange = oldestWeight ? (Number(latestWeight) - Number(oldestWeight)).toFixed(1) : "暂无趋势";

  return [
    `建议类型：${type}`,
    `用户档案：性别 ${profile.gender}，年龄 ${metrics.age ?? "未填写"}，身高 ${profile.heightCm ?? "未填写"}cm，活动水平 ${profile.activityLevel}，健康目标 ${profile.healthGoal}。`,
    `当前体重：${latestWeight}kg，目标体重：${profile.weightTargetKg ?? "未设置"}kg，BMI：${metrics.bmi ?? "无法计算"}（${metrics.bmiCategory ?? "未知"}），BMR：${metrics.bmr ?? "无法计算"}，TDEE：${metrics.tdee ?? "无法计算"}。`,
    `今日饮食：摄入 ${latestSummary?.totalKcal ?? 0}kcal，目标 ${latestSummary?.targetKcal ?? "未设置"}kcal，蛋白质 ${latestSummary?.totalProteinG ?? "0"}g，碳水 ${latestSummary?.totalCarbsG ?? "0"}g，脂肪 ${latestSummary?.totalFatG ?? "0"}g。`,
    `近 7 天平均摄入：${averageKcal}kcal；近 30 天运动 ${exerciseCount} 次，总消耗 ${totalExerciseKcal}kcal；体重变化：${weightChange}kg。`,
  ].join("\n");
}

async function requestAiAdvice(systemPrompt: string, userContext: string, taskPrompt: string, userId: string): Promise<string | null> {
  const userConfig = await db.query.userAiConfigs.findFirst({
    where: eq(userAiConfigs.userId, userId),
  });
  const effectiveConfig = getEffectiveConfig(userConfig ?? null);
  if (!effectiveConfig) return null;

  const response = await fetch(effectiveConfig.baseUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${effectiveConfig.apiKey}`,
    },
    body: JSON.stringify({
      model: effectiveConfig.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `${userContext}\n\n${taskPrompt}` },
      ],
      temperature: 0.3,
      max_tokens: 1200,
    }),
  });

  if (!response.ok) return null;

  const result = (await response.json().catch(() => null)) as { choices?: Array<{ message?: { content?: string } }> } | null;
  return result?.choices?.[0]?.message?.content ?? null;
}

export async function getAdvices(
  userId: string,
  type?: AiAdviceType,
  range: "7d" | "30d" | "90d" = "7d",
  options?: { includeDismissed?: boolean; includeHistory?: boolean },
): Promise<AiAdviceData[]> {
  const conditions = [eq(aiAdvices.userId, userId)];
  if (type) conditions.push(eq(aiAdvices.type, type));
  if (!options?.includeHistory) conditions.push(gt(aiAdvices.expiresAt, new Date()));
  if (!options?.includeDismissed) conditions.push(eq(aiAdvices.dismissed, false));

  const rows = await db.query.aiAdvices.findMany({
    where: and(...conditions),
    orderBy: [desc(aiAdvices.createdAt)],
  });

  return rows.map(mapAdviceRow);
}

export async function generateAdvice(userId: string, type: AiAdviceType, force: boolean): Promise<AiAdviceData> {
  if (!force) {
    const cachedAdvice = await db.query.aiAdvices.findFirst({
      where: and(eq(aiAdvices.userId, userId), eq(aiAdvices.type, type), gt(aiAdvices.expiresAt, new Date())),
      orderBy: [desc(aiAdvices.createdAt)],
    });

    if (cachedAdvice) return mapAdviceRow(cachedAdvice);
  }

  const [profileResponse, recentData] = await Promise.all([getProfile(userId), getRecentAdviceData(userId)]);
  if (!profileResponse.profile.aiAdviceEnabled && !force) {
    throw new Error("AI 建议已关闭");
  }

  if (type === "daily_diet" && !recentData.summaries.some((summary) => summary.logDate === todayDate() && summary.totalKcal > 0)) {
    throw new Error("暂无足够数据生成今日建议");
  }

  const template = AI_ADVICE_PROMPTS[type];
  const userContext = buildUserContext(profileResponse, recentData, type);
  const rawContent = await requestAiAdvice(template.systemPrompt, userContext, template.taskPrompt, userId);
  const sanitizedPayload = rawContent ? sanitizeAdvice(rawContent) : fallbackAdvicePayload();
  const [createdAdvice] = await db.insert(aiAdvices).values({
    userId,
    type,
    summary: sanitizedPayload.summary,
    suggestions: sanitizedPayload.suggestions,
    expiresAt: getAdviceExpiration(type),
  }).returning();

  return mapAdviceRow(createdAdvice);
}

export async function deleteAdvice(userId: string, id: string): Promise<boolean> {
  const deletedRows = await db.delete(aiAdvices)
    .where(and(eq(aiAdvices.userId, userId), eq(aiAdvices.id, id)))
    .returning({ id: aiAdvices.id });

  return deletedRows.length > 0;
}

export async function feedbackAdvice(userId: string, id: string, feedback: "helpful" | "not_helpful"): Promise<boolean> {
  const [updated] = await db.update(aiAdvices).set({ feedback, feedbackAt: new Date() })
    .where(and(eq(aiAdvices.userId, userId), eq(aiAdvices.id, id)))
    .returning({ id: aiAdvices.id });

  return updated !== undefined;
}

export async function completeAdvice(userId: string, id: string): Promise<boolean> {
  const [updated] = await db.update(aiAdvices).set({ completedAt: new Date() })
    .where(and(eq(aiAdvices.userId, userId), eq(aiAdvices.id, id)))
    .returning({ id: aiAdvices.id });

  return updated !== undefined;
}

export async function dismissAdvice(userId: string, id: string): Promise<boolean> {
  const [updated] = await db.update(aiAdvices).set({ dismissed: true, dismissedAt: new Date() })
    .where(and(eq(aiAdvices.userId, userId), eq(aiAdvices.id, id)))
    .returning({ id: aiAdvices.id });

  return updated !== undefined;
}

export async function reactivateAdvice(userId: string, id: string): Promise<AiAdviceData | null> {
  const existing = await db.query.aiAdvices.findFirst({
    where: and(eq(aiAdvices.userId, userId), eq(aiAdvices.id, id)),
  });

  if (!existing) return null;

  const newExpiresAt = getAdviceExpiration(existing.type);
  await db.update(aiAdvices).set({ expiresAt: newExpiresAt, dismissed: false, dismissedAt: null })
    .where(and(eq(aiAdvices.userId, userId), eq(aiAdvices.id, id)));

  const reactivated = await db.query.aiAdvices.findFirst({
    where: and(eq(aiAdvices.userId, userId), eq(aiAdvices.id, id)),
  });

  return reactivated ? mapAdviceRow(reactivated) : null;
}
