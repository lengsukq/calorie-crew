import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <span className="text-xl font-bold">C</span>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-foreground">登录</h1>
        <p className="mt-1 text-sm text-muted-foreground">CalorieCrew</p>
      </div>

      <AuthForm mode="login" />

      <p className="text-center text-sm text-muted-foreground">
        还没有账号？{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          注册
        </Link>
      </p>
    </div>
  );
}
