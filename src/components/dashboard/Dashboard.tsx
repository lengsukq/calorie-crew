"use client";

import { FormEvent, useEffect, useState } from "react";
import { mealTypes, type MealType } from "@/lib/db/schema";

interface DashboardProps { email: string; role: string; }
interface Log { id: string; mealType: MealType; foodName: string; calories: number; servingDescription: string; }
interface Summary { totalKcal: number; remainingKcal: number; totalProteinG: string; totalCarbsG: string; totalFatG: string; }

const today = new Date().toISOString().slice(0, 10);

export function Dashboard({ email, role }: DashboardProps) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [maxUses, setMaxUses] = useState(1);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    const response = await fetch(`/api/dashboard/today?date=${today}`);
    if (!response.ok) return;
    const result = await response.json() as { logs: Log[]; summary: Summary | null };
    setLogs(result.logs); setSummary(result.summary);
  }

  useEffect(() => { void load(); }, []);

  async function addLog(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/food-logs", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ logDate: today, mealType: form.get("mealType"), foodName: form.get("foodName"), servingDescription: form.get("servingDescription"), calories: Number(form.get("calories")), proteinG: Number(form.get("proteinG")), carbsG: Number(form.get("carbsG")), fatG: Number(form.get("fatG")) }) });
    if (!response.ok) { setMessage("保存失败，请检查输入"); return; }
    event.currentTarget.reset(); setMessage("已保存"); await load();
  }

  async function createInvite() {
    const response = await fetch("/api/admin/invites", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ maxUses }) });
    const result = await response.json() as { invite?: { code: string }; error?: string };
    setInviteCode(result.invite?.code ?? null); setMessage(result.error ?? "邀请码已创建");
  }

  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); location.href = "/login"; }

  return <div className="stack">
    <header className="page-header"><div><p className="muted">{email}</p><h1>今天吃得怎么样？</h1></div><button className="secondary" onClick={logout}>退出</button></header>
    {message && <p role="status">{message}</p>}
    <section className="grid">
      <div className="card"><strong>今日热量</strong><p>{summary?.totalKcal ?? 0} kcal</p></div>
      <div className="card"><strong>剩余热量</strong><p>{summary?.remainingKcal ?? 2000} kcal</p></div>
      <div className="card"><strong>蛋白质</strong><p>{summary?.totalProteinG ?? "0"} g</p></div>
      <div className="card"><strong>脂肪</strong><p>{summary?.totalFatG ?? "0"} g</p></div>
    </section>
    <section className="card stack"><h2>添加饮食记录</h2><form className="stack" onSubmit={addLog}><div className="grid"><label>餐次<select name="mealType" defaultValue="breakfast">{mealTypes.map((type) => <option key={type}>{type}</option>)}</select></label><label>食物<input name="foodName" required /></label><label>份量<input name="servingDescription" placeholder="1 碗" required /></label><label>热量<input name="calories" type="number" min="0" required /></label></div><div className="grid"><label>蛋白质(g)<input name="proteinG" type="number" min="0" step="0.01" defaultValue="0" /></label><label>碳水(g)<input name="carbsG" type="number" min="0" step="0.01" defaultValue="0" /></label><label>脂肪(g)<input name="fatG" type="number" min="0" step="0.01" defaultValue="0" /></label><span /></div><button>保存记录</button></form></section>
    <section className="card"><h2>今日记录</h2>{logs.length === 0 ? <p className="muted">今天还没有记录。</p> : <ul>{logs.map((log) => <li key={log.id}>{log.mealType} · {log.foodName} · {log.calories} kcal</li>)}</ul>}</section>
    {role === "admin" && <section className="card stack"><h2>管理员：创建邀请码</h2><label>可使用次数<input type="number" min="1" max="1000" value={maxUses} onChange={(event) => setMaxUses(Number(event.target.value))} /></label><button onClick={createInvite}>生成邀请码</button>{inviteCode && <p><strong>请分发：</strong> <code>{inviteCode}</code></p>}</section>}
  </div>;
}
