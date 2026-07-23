import { redirect } from "next/navigation";
import { Toaster } from "sonner";
import { getSessionUserId } from "@/lib/auth/session";
import { getUserProfile } from "@/lib/services/user.service";
import { TopBar } from "@/components/layout/TopBar";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileTabBar } from "@/components/layout/MobileTabBar";

interface TabsLayoutProps {
  children: React.ReactNode;
}

export default async function TabsLayout({ children }: TabsLayoutProps) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const user = await getUserProfile(userId);

  return (
    <div className="min-h-dvh bg-background">
      <Sidebar email={user?.email} />

      <div className="lg:pl-64">
        <TopBar email={user?.email} role={user?.role} />
        <main className="mx-auto w-full max-w-5xl px-4 py-6 pb-28 lg:px-8 lg:py-8 lg:pb-8">
          {children}
        </main>
      </div>

      <MobileTabBar />

      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
    </div>
  );
}
