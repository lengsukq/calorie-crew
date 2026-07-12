import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export default function RegisterPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Decorative bubbles */}
      <div
        className="y2k-bubble"
        style={{
          top: "10%",
          right: "12%",
          width: "120px",
          height: "120px",
          animationDelay: "0s",
        }}
      />
      <div
        className="y2k-bubble"
        style={{
          bottom: "30%",
          left: "8%",
          width: "90px",
          height: "90px",
          animationDelay: "1.5s",
        }}
      />
      <div
        className="y2k-bubble"
        style={{
          bottom: "10%",
          right: "25%",
          width: "70px",
          height: "70px",
          animationDelay: "3s",
        }}
      />

      <div className="glass-card glass-card-narrow relative z-10">
        <div className="mb-2 text-center">
          {/* Logo bubble */}
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
      </div>
    </main>
  );
}
