import { FileText, LayoutDashboard, Users } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
};

export const navigation: NavItem[] = [
  { label: "대시보드", href: "/dashboard", icon: LayoutDashboard },
  { label: "게시글", href: "/posts", icon: FileText },
  { label: "사용자", href: "/users", icon: Users },
];
