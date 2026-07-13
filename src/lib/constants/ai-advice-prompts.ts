import type { AiAdviceType } from "@/lib/db/schema";

export interface AdvicePromptTemplate {
  systemPrompt: string;
  taskPrompt: string;
}

const OUTPUT_FORMAT_PROMPT = `请只返回 JSON，不要使用 Markdown 代码块或额外解释。格式：
{
  "summary": "一句话总结",
  "suggestions": [
    { "title": "建议标题", "detail": "具体可执行建议", "priority": "high|medium|low" }
  ]
}`;

export const AI_ADVICE_PROMPTS: Record<AiAdviceType, AdvicePromptTemplate> = {
  daily_diet: {
    systemPrompt: "你是一位专业、温和的营养师助手，只提供一般性健康信息，不进行医学诊断或治疗建议。",
    taskPrompt: `基于用户今日和近 7 天饮食数据，给出最多 3 条可执行的饮食优化建议。优先关注蛋白质摄入、热量控制和营养均衡。避免极端节食、医疗化措辞和身材焦虑。\n\n${OUTPUT_FORMAT_PROMPT}`,
  },
  weekly_summary: {
    systemPrompt: "你是一位健身与体重管理顾问，用鼓励、务实的语气帮助用户复盘一周数据。",
    taskPrompt: `分析近 7 天体重、运动、摄入数据，指出趋势是否稳定，并给出下周饮食与运动调整建议。避免医学诊断和绝对化用语。\n\n${OUTPUT_FORMAT_PROMPT}`,
  },
  bmi_alert: {
    systemPrompt: "你是一位健康科普顾问，语气温和、鼓励，不制造身材焦虑。",
    taskPrompt: `基于 BMI 结果提供 2-3 条改善建议，强调健康第一，并提醒 BMI 只是粗略参考。避免疾病诊断、治疗和处方建议。\n\n${OUTPUT_FORMAT_PROMPT}`,
  },
  goal_reminder: {
    systemPrompt: "你是一位健康习惯教练，帮助用户把长期目标拆成今天可执行的小行动。",
    taskPrompt: `结合用户健康目标和近期记录，给出 2-3 条目标提醒与行动建议。建议必须具体、可完成、不过度苛刻。\n\n${OUTPUT_FORMAT_PROMPT}`,
  },
};
