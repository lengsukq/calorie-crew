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

const SYSTEM_PROMPT = `你是一个食物营养分析助手。分析图片中的食物，估算每份食物的营养成分。
规则：
- 识别图中每一种食物，估算合理的份量
- 根据常见的食物营养数据库估算热量和三大营养素
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
用户发了一张包含米饭和红烧肉的图片
返回：{
  "foods": [
    { "foodName": "米饭", "servingDescription": "1 碗(200g)", "calories": 232, "proteinG": 5.2, "carbsG": 51.8, "fatG": 0.6 },
    { "foodName": "红烧肉", "servingDescription": "1 份(150g)", "calories": 525, "proteinG": 22.5, "carbsG": 7.5, "fatG": 45 }
  ]
}`;

/**
 * Get effective AI config: user config takes precedence, falls back to env vars.
 */
export function getEffectiveConfig(
  userConfig: { baseUrl?: string | null; model?: string | null; apiKey?: string | null } | null,
): AiConfig | null {
  const baseUrl = userConfig?.baseUrl || env.AI_BASE_URL;
  const model = userConfig?.model || env.AI_MODEL;
  const apiKey = userConfig?.apiKey || env.AI_API_KEY;

  if (!baseUrl || !model || !apiKey) {
    return null;
  }

  return { baseUrl, model, apiKey };
}

/**
 * Call LLM API with multimodal (image + text) to recognize food.
 * If image is provided, uses vision model format.
 */
export async function recognizeFood(
  params: {
    imageBase64?: string;
    mimeType?: string;
    description?: string;
  },
  config: AiConfig,
): Promise<RecognizedResponse> {
  const userText =
    params.description || "识别图中所有食物，按份量估算营养数据，返回JSON";

  let body: Record<string, unknown>;

  if (params.imageBase64) {
    // Multimodal: image + text
    body = {
      model: config.model,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${params.mimeType || "image/jpeg"};base64,${params.imageBase64}`,
              },
            },
            { type: "text", text: `${SYSTEM_PROMPT}\n\n${userText}` },
          ],
        },
      ],
      temperature: 0.1,
      max_tokens: 2048,
    };
  } else {
    // Text-only fallback
    body = {
      model: config.model,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userText },
      ],
      temperature: 0.1,
      max_tokens: 1024,
    };
  }

  const response = await fetch(config.baseUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify(body),
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

  const jsonStr = extractJson(content);
  if (!jsonStr) {
    throw new Error("AI 返回格式异常，无法解析");
  }

  const parsed = JSON.parse(jsonStr) as RecognizedResponse;

  if (!parsed.foods || !Array.isArray(parsed.foods) || parsed.foods.length === 0) {
    throw new Error("AI 未识别出食物，请换一张图片");
  }

  parsed.foods = (parsed.foods as unknown as Record<string, unknown>[]).map(sanitizeFood);

  return parsed;
}

function extractJson(text: string): string | null {
  const blockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (blockMatch) {
    return blockMatch[1].trim();
  }
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }
  return null;
}

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
