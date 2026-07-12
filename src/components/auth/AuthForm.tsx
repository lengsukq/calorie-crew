"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

interface AuthFormProps { mode: "login" | "register"; }

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null); setPending(true);
    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password"), inviteCode: form.get("inviteCode") }) });
    const result = await response.json() as { error?: string };
    setPending(false);
    if (!response.ok) { setError(result.error ?? "操作失败"); return; }
    router.push("/dashboard"); router.refresh();
  }

  return <form className="stack" onSubmit={submit}>
    <label>邮箱<input name="email" type="email" autoComplete="email" required /></label>
    <label>密码<input name="password" type="password" minLength={8} autoComplete={mode === "login" ? "current-password" : "new-password"} required /></label>
    {mode === "register" && <label>邀请码<input name="inviteCode" type="text" autoComplete="off" required /></label>}
    {error && <p role="alert">{error}</p>}
    <button disabled={pending}>{pending ? "处理中…" : mode === "login" ? "登录" : "注册"}</button>
  </form>;
}
