import Link from "next/link";
import { AuthForm } from "@/components/auth/AuthForm";

export default function RegisterPage() {
  return <main><div className="card stack narrow-card"><h1>创建 CalorieCrew 账号</h1><AuthForm mode="register" /><p className="muted">已有账号？ <Link href="/login">登录</Link></p></div></main>;
}
