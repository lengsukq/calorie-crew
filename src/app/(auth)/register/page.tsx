import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export default function RegisterPage() {
  return (
    <div className="mx-auto w-full max-w-sm space-y-6">
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <span className="text-xl font-bold">C</span>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-foreground">创建账号</h1>
        <p className="mt-1 text-sm text-muted-foreground">CalorieCrew</p>
      </div>

      <AuthForm mode="register" />

      <p className="text-center text-sm text-muted-foreground">
        已有账号？{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          登录
        </Link>
      </p>
    </div>
  );
}
