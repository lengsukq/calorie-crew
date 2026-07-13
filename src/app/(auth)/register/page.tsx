import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export default function RegisterPage() {
  return (
    <>
      <div className="mb-2 text-center">
        <div className="y2k-logo">
          <div />
          <span>C</span>
        </div>
        <h1 className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-3xl font-black text-transparent">
          创建账号
        </h1>
        <p className="mt-1 text-sm text-slate-500">CalorieCrew</p>
      </div>

      <div className="mt-6">
        <AuthForm mode="register" />
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-500">
          已有账号？{" "}
          <Link href="/login" className="font-semibold">
            登录
          </Link>
        </p>
      </div>
    </>
  );
}
