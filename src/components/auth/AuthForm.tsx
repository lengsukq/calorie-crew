"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api/client";
import { login, register } from "@/lib/api/auth";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const inviteCode = String(form.get("inviteCode") ?? "");
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password, inviteCode);
      }
    } catch (err) {
      setPending(false);
      setError(err instanceof ApiError ? err.message : "操作失败");
      return;
    }
    setPending(false);
    router.push("/today");
    router.refresh();
  }

  return (
    <form className="stack" onSubmit={submit}>
      <label className="stack gap-1.5">
        <span className="glass-label">邮箱</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          className="glass-input"
          placeholder="your@email.com"
        />
      </label>

      <label className="stack gap-1.5">
        <span className="glass-label">密码</span>
        <input
          name="password"
          type="password"
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          required
          className="glass-input"
          placeholder={mode === "login" ? "输入密码" : "至少 8 位密码"}
        />
      </label>

      {mode === "register" && (
        <label className="stack gap-1.5">
          <span className="glass-label">邀请码</span>
          <input
            name="inviteCode"
            type="text"
            autoComplete="off"
            required
            className="glass-input"
            placeholder="请输入邀请码"
          />
        </label>
      )}

      {error && (
        <p role="alert" className="glass-message-error">
          {error}
        </p>
      )}

      <button disabled={pending} className="glass-button-primary mt-2 w-full">
        {pending ? (
          <span className="flex items-center gap-2">
            <span className="y2k-spinner" />
            处理中...
          </span>
        ) : mode === "login" ? (
          "登录"
        ) : (
          "注册"
        )}
      </button>
    </form>
  );
}
