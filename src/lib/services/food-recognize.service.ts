import { env } from "@/lib/env";

export interface RecognizedFood {
  foodName: string;
  servingDescription: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

interface AiConfig {
  baseUrl: string;
  model: string;
  apiKey: string;
}

interface RecognizedResponse {
  foods: RecognizedFood[];
}

const SYSTEM_PROMPT = `你是一个食物营养分析助手。用户会描述他们吃的食物，请分析营养成分并以 JSON 格式返回。
规则：
- 根据常见的食物营养数据库估算
- 份量要合理且具体
- 只返回 JSON，不要任何其他文字

返回格式：
{
  "foods": [
    {
      "foodName": "食物名称",
      "servingDescription": "份量描述（如'1 碗'、'200 克'）",
      "calories": 热量数值(整数),
      "proteinG": 蛋白质克数,
      "carbsG": 碳水克数,
      "fatG": 脂肪克数
    }
  ]
}

示例：
用户说："中午吃了一碗米饭和一份红烧肉"
返回：{
  "foods": [
    { "foodName": "米饭", "servingDescription": "1 碗", "calories": 200, "proteinG": 3, "carbsG": 45, "fatG": 0.5 },
    { "foodName": "红烧肉", "servingDescription": "1 份", "calories": 350, "proteinG": 15, "carbsG": 5, "fatG": 30 }
  ]
}`;

/**
 * Get effective AI config: user config takes precedence, falls back to env vars.
 */
export function getEffectiveConfig(userConfig: { baseUrl?: string | null; model?: string | null; apiKey?: string | null } | null): AiConfig | null {
  const baseUrl = userConfig?.baseUrl || env.AI_BASE_URL;
  const model = userConfig?.model || env.AI_MODEL;
  const apiKey = userConfig?.apiKey || env.AI_API_KEY;

  if (!baseUrl || !model || !apiKey) {
    return null;
  }

  return { baseUrl, model, apiKey };
}

/**
 * Call LLM API to recognize food from a text description.
 * Returns structured food data or throws on failure.
 */
export async function recognizeFood(
  description: string,
  config: AiConfig,
): Promise<RecognizedResponse> {
  const response = await fetch(config.baseUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: description },
      ],
      temperature: 0.1,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(`AI 识别服务调用失败 (${response.status}): ${errorText}`);
  }

  const result = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = result?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("AI 返回内容为空，请重试");
  }

  // Extract JSON from response (handle markdown code blocks)
  const jsonStr = extractJson(content);
  if (!jsonStr) {
    throw new Error("AI 返回格式异常，无法解析");
  }

  const parsed = JSON.parse(jsonStr) as RecognizedResponse;

  if (!parsed.foods || !Array.isArray(parsed.foods) || parsed.foods.length === 0) {
    throw new Error("AI 未识别出食物，请换一种描述方式");
  }

  // Validate and sanitize each food item
  parsed.foods = (parsed.foods as unknown as Record<string, unknown>[]).map(sanitizeFood);

  return parsed;
}

/**
 * Extract JSON string from AI response (handles markdown code blocks).
 */
function extractJson(text: string): string | null {
  // Try to extract from markdown code block first
  const blockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (blockMatch) {
    return blockMatch[1].trim();
  }

  // Try to find JSON object directly
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }

  return null;
}

/**
 * Sanitize and validate a recognized food item.
 */
function sanitizeFood(item: Record<string, unknown>): RecognizedFood {
  return {
    foodName: String(item.foodName ?? "").trim() || "未知食物",
    servingDescription: String(item.servingDescription ?? "").trim() || "1 份",
    calories: Math.max(0, Math.round(Number(item.calories) || 0)),
    proteinG: Math.max(0, Number(item.proteinG) || 0),
    carbsG: Math.max(0, Number(item.carbsG) || 0),
    fatG: Math.max(0, Number(item.fatG) || 0),
  };
}
