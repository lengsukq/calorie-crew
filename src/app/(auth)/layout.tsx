import { AuthForm } from "@/components/auth/AuthForm";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-cyan-50 via-background to-blue-50 px-4 py-12 dark:from-slate-950 dark:via-background dark:to-slate-900">
      {children}
    </main>
  );
}
