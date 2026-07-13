import type { AiAdviceSuggestion } from "@/lib/db/schema";

export interface SanitizedAdvicePayload {
  summary: string;
  suggestions: AiAdviceSuggestion[];
}

export const UNSAFE_CONTENT_PATTERNS = [
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

export function fallbackAdvicePayload(message = "建议暂时不可用，请稍后重试。"): SanitizedAdvicePayload {
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

export function containsUnsafeContent(text: string): boolean {
  return UNSAFE_CONTENT_PATTERNS.some((pattern) => text.includes(pattern));
}

export function extractJson(text: string): string | null {
  const blockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (blockMatch) return blockMatch[1].trim();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? jsonMatch[0] : null;
}

function normalizePriority(value: unknown): AiAdviceSuggestion["priority"] {
  if (value === "high" || value === "medium" || value === "low") return value;
  return "medium";
}

export function sanitizeAdvice(rawContent: string): SanitizedAdvicePayload {
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
