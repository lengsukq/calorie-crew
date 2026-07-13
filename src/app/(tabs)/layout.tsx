import { Toaster } from "sonner";
import { TopBar } from "@/components/layout/TopBar";
import { TabBar } from "@/components/layout/TabBar";

interface TabsLayoutProps {
  children: React.ReactNode;
}

export default function TabsLayout({ children }: TabsLayoutProps) {
  return (
    <div className="app-shell">
      <TopBar />
      <main className="app-content">
        <div className="mx-auto w-full max-w-5xl px-4 py-5">{children}</div>
      </main>
      <TabBar />
      <Toaster
        position="top-center"
        toastOptions={{
          className: "glass-message",
          duration: 3000,
        }}
      />
    </div>
  );
}
