"use client";

import { navigation } from "@/config/navigation";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";
import { PanelLeftClose, PanelLeftOpen, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex flex-col h-full border-r border-border bg-card transition-all duration-200 shrink-0",
        sidebarCollapsed ? "w-16" : "w-56",
      )}
    >
      {/* Brand */}
      <div className="flex items-center h-14 px-3 border-b border-border gap-2 shrink-0">
        <ShieldCheck className="size-5 text-primary shrink-0" />
        {!sidebarCollapsed && (
          <span className="font-semibold text-sm truncate">SUDO Admin</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors",
                sidebarCollapsed && "justify-center px-2",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon className="size-4 shrink-0" />
              {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-border shrink-0">
        <button
          type="button"
          onClick={toggleSidebar}
          className={cn(
            "flex items-center gap-2.5 w-full px-2.5 py-2 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
            sidebarCollapsed && "justify-center px-2",
          )}
          title={sidebarCollapsed ? "사이드바 열기" : "사이드바 닫기"}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="size-4 shrink-0" />
          ) : (
            <>
              <PanelLeftClose className="size-4 shrink-0" />
              <span>접기</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
