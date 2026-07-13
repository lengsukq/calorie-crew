import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <>
      <div className="mb-2 text-center">
        <div className="y2k-logo">
          <div />
          <span>C</span>
        </div>
        <h1 className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-3xl font-black text-transparent">
          登录
        </h1>
        <p className="mt-1 text-sm text-slate-500">CalorieCrew</p>
      </div>

      <div className="mt-6">
        <AuthForm mode="login" />
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-500">
          还没有账号？{" "}
          <Link href="/register" className="font-semibold">
            注册
          </Link>
        </p>
      </div>
    </>
  );
}
