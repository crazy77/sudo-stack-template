import {
  FileText,
  LayoutDashboard,
  type LucideIcon,
  Settings,
  Users,
  Wrench,
} from "lucide-react";

export type NavItem = {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  devOnly?: boolean;
};

export type NavGroup = {
  id: string;
  heading: string;
  items: NavItem[];
};

export const navigation: NavGroup[] = [
  {
    id: "main",
    heading: "메인",
    items: [
      {
        id: "dashboard",
        label: "대시보드",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    id: "content",
    heading: "콘텐츠",
    items: [
      { id: "posts", label: "게시글", href: "/posts", icon: FileText },
      { id: "users", label: "사용자", href: "/users", icon: Users },
    ],
  },
  {
    id: "system",
    heading: "시스템",
    items: [
      { id: "settings", label: "설정", href: "/settings", icon: Settings },
      {
        id: "entity-generator",
        label: "엔티티 생성기",
        href: "/dev/entity-generator",
        icon: Wrench,
        devOnly: true,
      },
    ],
  },
];
