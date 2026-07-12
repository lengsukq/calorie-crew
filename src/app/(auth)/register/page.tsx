import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export default function RegisterPage() {
  return (
    <>
      <div className="mb-2 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 via-blue-400 to-teal-400 shadow-xl">
          <div className="h-8 w-8 rounded-full bg-white/60 blur-sm" />
          <span className="absolute text-xl font-bold text-white">C</span>
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
