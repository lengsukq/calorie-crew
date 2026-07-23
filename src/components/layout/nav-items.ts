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

/** 移动端底部导航：中央记录按钮左侧的标签 */
export const NAV_ITEMS_LEFT: NavItem[] = NAV_ITEMS.filter((item) =>
  ["today", "diary"].includes(item.id),
);

/** 移动端底部导航：中央记录按钮右侧的标签 */
export const NAV_ITEMS_RIGHT: NavItem[] = NAV_ITEMS.filter((item) =>
  ["progress", "profile"].includes(item.id),
);
