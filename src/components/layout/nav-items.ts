import {
  Home,
  BookOpen,
  BarChart3,
  User,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  href: "/today" | "/diary" | "/progress" | "/profile";
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { id: "today", label: "今日", href: "/today", icon: Home },
  { id: "diary", label: "日记", href: "/diary", icon: BookOpen },
  { id: "progress", label: "进度", href: "/progress", icon: BarChart3 },
  { id: "profile", label: "我的", href: "/profile", icon: User },
];

export const TAB_TITLES: Record<string, string> = {
  today: "今日",
  diary: "饮食日记",
  progress: "进度",
  profile: "我的",
};
