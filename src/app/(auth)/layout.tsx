import { AuthBackground } from "@/components/auth/AuthBackground";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <AuthBackground />
      <div className="glass-card glass-card-narrow relative z-10">
        {children}
      </div>
    </main>
  );
}
