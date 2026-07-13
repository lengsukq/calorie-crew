import { describe, expect, it } from "vitest";
import { fallbackAdvicePayload, sanitizeAdvice } from "@/lib/services/advice-safety";

describe("sanitizeAdvice", () => {
  it("parses valid JSON with suggestions", () => {
    const rawContent = JSON.stringify({
      summary: "今日蛋白质摄入偏低",
      suggestions: [
        { title: "增加蛋白质", detail: "建议午餐增加 100g 鸡胸肉", priority: "high" },
      ],
    });
    const result = sanitizeAdvice(rawContent);
    expect(result.summary).toBe("今日蛋白质摄入偏低");
    expect(result.suggestions).toHaveLength(1);
    expect(result.suggestions[0].title).toBe("增加蛋白质");
    expect(result.suggestions[0].priority).toBe("high");
  });

  it("extracts JSON from markdown code block", () => {
    const rawContent = "```json\n" + JSON.stringify({
      summary: "测试摘要",
      suggestions: [
        { title: "建议一", detail: "详情一", priority: "medium" },
      ],
    }) + "\n```";
    const result = sanitizeAdvice(rawContent);
    expect(result.summary).toBe("测试摘要");
    expect(result.suggestions).toHaveLength(1);
  });

  it("returns fallback when content contains unsafe medical terms", () => {
    const rawContent = JSON.stringify({
      summary: "根据你的症状，诊断为代谢问题",
      suggestions: [
        { title: "治疗建议", detail: "需要处方药物治疗", priority: "high" },
      ],
    });
    const result = sanitizeAdvice(rawContent);
    expect(result.summary).toBe("建议暂时不可用，请稍后重试。");
    expect(result.suggestions).toHaveLength(1);
    expect(result.suggestions[0].title).toBe("保持记录");
  });

  it("returns fallback when JSON cannot be parsed", () => {
    const result = sanitizeAdvice("这不是 JSON 格式的内容");
    expect(result.summary).toBe("建议暂时不可用，请稍后重试。");
    expect(result.suggestions[0].title).toBe("保持记录");
  });

  it("returns fallback when summary is empty", () => {
    const rawContent = JSON.stringify({
      summary: "",
      suggestions: [
        { title: "建议", detail: "详情", priority: "low" },
      ],
    });
    const result = sanitizeAdvice(rawContent);
    expect(result.summary).toBe("建议暂时不可用，请稍后重试。");
  });

  it("returns fallback when suggestions array is empty", () => {
    const rawContent = JSON.stringify({
      summary: "有摘要但没有建议",
      suggestions: [],
    });
    const result = sanitizeAdvice(rawContent);
    expect(result.summary).toBe("建议暂时不可用，请稍后重试。");
  });

  it("normalizes invalid priority to medium", () => {
    const rawContent = JSON.stringify({
      summary: "测试优先级",
      suggestions: [
        { title: "建议", detail: "详情", priority: "invalid" },
      ],
    });
    const result = sanitizeAdvice(rawContent);
    expect(result.suggestions[0].priority).toBe("medium");
  });

  it("filters out suggestions with unsafe content but keeps valid ones", () => {
    const rawContent = JSON.stringify({
      summary: "混合建议测试",
      suggestions: [
        { title: "正常建议", detail: "多吃蔬菜", priority: "low" },
        { title: "危险建议", detail: "快速减肥方法", priority: "high" },
      ],
    });
    const result = sanitizeAdvice(rawContent);
    expect(result.suggestions).toHaveLength(1);
    expect(result.suggestions[0].title).toBe("正常建议");
  });

  it("limits suggestions to 3 items", () => {
    const rawContent = JSON.stringify({
      summary: "多条建议测试",
      suggestions: [
        { title: "建议1", detail: "详情1", priority: "high" },
        { title: "建议2", detail: "详情2", priority: "medium" },
        { title: "建议3", detail: "详情3", priority: "low" },
        { title: "建议4", detail: "详情4", priority: "low" },
        { title: "建议5", detail: "详情5", priority: "low" },
      ],
    });
    const result = sanitizeAdvice(rawContent);
    expect(result.suggestions).toHaveLength(3);
  });
});

describe("fallbackAdvicePayload", () => {
  it("returns default message when no argument provided", () => {
    const result = fallbackAdvicePayload();
    expect(result.summary).toBe("建议暂时不可用，请稍后重试。");
    expect(result.suggestions).toHaveLength(1);
  });

  it("uses custom message when provided", () => {
    const result = fallbackAdvicePayload("自定义降级提示");
    expect(result.summary).toBe("自定义降级提示");
  });
});
