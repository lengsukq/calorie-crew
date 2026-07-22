"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ApiError } from "@/lib/api/client";
import { login, register } from "@/lib/api/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="w-full max-w-sm">
      <div className="mb-6 flex flex-col items-center gap-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-2xl font-black text-white shadow-lg shadow-primary/25">
          C
        </div>
        <p className="text-xl font-bold text-foreground">CalorieCrew</p>
        <p className="text-xs text-muted-foreground">记录每一餐，了解每一天</p>
      </div>
      <Card className="border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-center text-lg">{mode === "login" ? "登录" : "注册"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-1.5">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="your@email.com"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={8}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              placeholder={mode === "login" ? "输入密码" : "至少 8 位密码"}
            />
          </div>

          {mode === "register" && (
            <div className="space-y-1.5">
              <Label htmlFor="inviteCode">邀请码</Label>
              <Input
                id="inviteCode"
                name="inviteCode"
                type="text"
                autoComplete="off"
                required
                placeholder="请输入邀请码"
              />
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {mode === "login" ? "登录中..." : "注册中..."}
              </>
            ) : mode === "login" ? (
              "登录"
            ) : (
              "注册"
            )}
          </Button>
        </form>
      </CardContent>
      </Card>
    </div>
  );
}
