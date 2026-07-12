import { AuthBackground } from "@/components/auth/AuthBackground";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <AuthBackground />
      <div className="glass-card glass-card-narrow relative z-10">
        {children}
      </div>
    </main>
  );
}
