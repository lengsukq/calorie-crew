"use client";

import { FormEvent, useEffect, useState } from "react";
import { mealTypes, type MealType } from "@/lib/db/schema";

interface DashboardProps {
  email: string;
  role: string;
}

interface Log {
  id: string;
  mealType: MealType;
  foodName: string;
  calories: number;
  servingDescription: string;
}

interface Summary {
  totalKcal: number;
  remainingKcal: number;
  totalProteinG: string;
  totalCarbsG: string;
  totalFatG: string;
}

const today = new Date().toISOString().slice(0, 10);

type SummaryCard = {
  label: string;
  value: string;
  unit: string;
  icon: string;
  gradient: string;
  trend?: string;
  trendUp?: boolean;
};

export function Dashboard({ email, role }: DashboardProps) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [maxUses, setMaxUses] = useState(1);
  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  async function load() {
    const response = await fetch(`/api/dashboard/today?date=${today}`);
    if (!response.ok) return;
    const result = (await response.json()) as {
      logs: Log[];
      summary: Summary | null;
    };
    setLogs(result.logs);
    setSummary(result.summary);
  }

  useEffect(() => {
    void load();
  }, []);

  async function addLog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/food-logs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        logDate: today,
        mealType: form.get("mealType"),
        foodName: form.get("foodName"),
        servingDescription: form.get("servingDescription"),
        calories: Number(form.get("calories")),
        proteinG: Number(form.get("proteinG")),
        carbsG: Number(form.get("carbsG")),
        fatG: Number(form.get("fatG")),
      }),
    });
    if (!response.ok) {
      setMessage({ text: "保存失败，请检查输入", type: "error" });
      return;
    }
    event.currentTarget.reset();
    setMessage({ text: "记录已保存", type: "success" });
    await load();
  }

  async function createInvite() {
    const response = await fetch("/api/admin/invites", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ maxUses }),
    });
    const result = (await response.json()) as {
      invite?: { code: string };
      error?: string;
    };
    setInviteCode(result.invite?.code ?? null);
    setMessage({
      text: result.error ?? "邀请码已创建",
      type: result.error ? "error" : "success",
    });
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    location.href = "/login";
  }

  const summaryCards: SummaryCard[] = [
    {
      label: "今日热量",
      value: String(summary?.totalKcal ?? 0),
      unit: "kcal",
      icon: "🔥",
      gradient: "from-cyan-400 to-blue-500",
    },
    {
      label: "剩余热量",
      value: String(summary?.remainingKcal ?? 2000),
      unit: "kcal",
      icon: "⚡",
      gradient: "from-amber-400 to-orange-500",
    },
    {
      label: "蛋白质",
      value: summary?.totalProteinG ?? "0",
      unit: "g",
      icon: "🥩",
      gradient: "from-purple-400 to-pink-500",
    },
    {
      label: "脂肪",
      value: summary?.totalFatG ?? "0",
      unit: "g",
      icon: "🧈",
      gradient: "from-teal-400 to-emerald-500",
    },
  ];

  return (
    <div className="stack">
      {/* Header */}
      <div className="glass-card !p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500">{email}</p>
            <h2 className="mt-0.5 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
              今天吃得怎么样？
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="glass-tag">{role}</span>
            <button onClick={logout} className="glass-button !px-4 !py-2 text-sm">
              退出
            </button>
          </div>
        </div>
      </div>

      {/* Message toast */}
      {message && (
        <div
          className={`animate-slide-in ${
            message.type === "success"
              ? "glass-message-success"
              : "glass-message-error"
          }`}
          role="status"
        >
          {message.text}
        </div>
      )}

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className={`icon-box bg-gradient-to-br ${card.gradient}`}>
              <span className="text-xl">{card.icon}</span>
            </div>
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                {card.label}
              </p>
              <p className="mt-1 text-3xl font-black text-slate-800">
                {card.value}
                <span className="ml-1 text-sm font-normal text-slate-400">
                  {card.unit}
                </span>
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Add food log form */}
      <div className="glass-card">
        <h2 className="mb-5 text-slate-800">添加饮食记录</h2>
        <form className="stack" onSubmit={addLog}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="stack gap-1.5">
              <span className="glass-label">餐次</span>
              <select
                name="mealType"
                defaultValue="breakfast"
                className="glass-select"
              >
                {mealTypes.map((type) => (
                  <option key={type}>{type}</option>
                ))}
              </select>
            </label>
            <label className="stack gap-1.5">
              <span className="glass-label">食物</span>
              <input
                name="foodName"
                required
                className="glass-input"
                placeholder="例如：米饭"
              />
            </label>
            <label className="stack gap-1.5">
              <span className="glass-label">份量</span>
              <input
                name="servingDescription"
                className="glass-input"
                placeholder="1 碗"
                required
              />
            </label>
            <label className="stack gap-1.5">
              <span className="glass-label">热量</span>
              <input
                name="calories"
                type="number"
                min="0"
                required
                className="glass-input"
                placeholder="200"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="stack gap-1.5">
              <span className="glass-label">蛋白质 (g)</span>
              <input
                name="proteinG"
                type="number"
                min="0"
                step="0.01"
                defaultValue="0"
                className="glass-input"
              />
            </label>
            <label className="stack gap-1.5">
              <span className="glass-label">碳水 (g)</span>
              <input
                name="carbsG"
                type="number"
                min="0"
                step="0.01"
                defaultValue="0"
                className="glass-input"
              />
            </label>
            <label className="stack gap-1.5">
              <span className="glass-label">脂肪 (g)</span>
              <input
                name="fatG"
                type="number"
                min="0"
                step="0.01"
                defaultValue="0"
                className="glass-input"
              />
            </label>
          </div>

          <button className="glass-button-primary mt-2 w-full sm:w-auto">
            保存记录
          </button>
        </form>
      </div>

      {/* Today's logs */}
      <div className="glass-card">
        <h2 className="mb-5 text-slate-800">今日记录</h2>
        {logs.length === 0 ? (
          <div className="py-8 text-center">
            <span className="text-3xl">📝</span>
            <p className="mt-2 text-sm text-slate-400">
              今天还没有记录，开始添加吧！
            </p>
          </div>
        ) : (
          <div className="stack gap-2">
            {logs.map((log) => (
              <div key={log.id} className="list-item">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="glass-tag">{log.mealType}</span>
                    <span className="text-sm font-semibold text-slate-700">
                      {log.foodName}
                    </span>
                    <span className="text-xs text-slate-400">
                      {log.servingDescription}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-cyan-600">
                    {log.calories} kcal
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Admin: invite section */}
      {role === "admin" && (
        <div className="glass-card border-amber-200/50">
          <h2 className="mb-5 text-slate-800">管理员：创建邀请码</h2>
          <div className="flex flex-wrap items-end gap-4">
            <label className="stack gap-1.5">
              <span className="glass-label">可使用次数</span>
              <input
                type="number"
                min="1"
                max="1000"
                value={maxUses}
                onChange={(event) => setMaxUses(Number(event.target.value))}
                className="glass-input w-32"
              />
            </label>
            <button onClick={createInvite} className="glass-button">
              生成邀请码
            </button>
          </div>
          {inviteCode && (
            <div className="glass-message-success mt-4 flex items-center gap-3">
              <span className="text-sm font-medium">邀请码：</span>
              <code className="rounded-lg bg-cyan-50 px-3 py-1 font-mono text-sm text-cyan-700">
                {inviteCode}
              </code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
