import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CalorieCrew",
  description: "记录每一餐，了解每一天。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
