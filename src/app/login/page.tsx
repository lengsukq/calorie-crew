import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export default function LoginPage() {
  return <main><div className="card stack narrow-card"><h1>登录 CalorieCrew</h1><AuthForm mode="login" /><p className="muted">还没有账号？ <Link href="/register">注册</Link></p></div></main>;
}
