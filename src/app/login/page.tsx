import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      {/* Decorative bubbles */}
      <div
        className="y2k-bubble"
        style={{
          top: "15%",
          left: "8%",
          width: "140px",
          height: "140px",
          animationDelay: "0s",
        }}
      />
      <div
        className="y2k-bubble"
        style={{
          top: "55%",
          right: "10%",
          width: "100px",
          height: "100px",
          animationDelay: "1s",
        }}
      />
      <div
        className="y2k-bubble"
        style={{
          bottom: "20%",
          left: "20%",
          width: "80px",
          height: "80px",
          animationDelay: "2s",
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
      </div>
    </main>
  );
}
