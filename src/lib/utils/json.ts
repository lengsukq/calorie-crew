/**
 * Extract JSON string from an LLM response that may contain markdown
 * code fences or other wrapping text.
 */
export function extractJson(text: string): string | null {
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
