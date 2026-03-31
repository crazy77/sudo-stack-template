"use client";

import {
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type NavGroup, navigation } from "@/config/navigation";

// process.env.NODE_ENV는 빌드 타임 상수 — 한 번만 필터링
const filteredNavigation = navigation
  .map((group) => ({
    ...group,
    items: group.items.filter(
      (item) => !item.devOnly || process.env.NODE_ENV === "development",
    ),
  }))
  .filter((group) => group.items.length > 0);

import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";

function NavGroupSection({
  group,
  collapsed,
}: {
  group: NavGroup;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const { collapsedGroups, toggleGroup } = useUIStore();
  const isGroupCollapsed = collapsedGroups[group.id];

  return (
    <div>
      {!collapsed && (
        <button
          type="button"
          onClick={() => toggleGroup(group.id)}
          className="flex w-full items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 hover:text-muted-foreground transition-colors"
        >
          {group.heading}
          <ChevronDown
            className={cn(
              "size-3 transition-transform",
              isGroupCollapsed && "-rotate-90",
            )}
          />
        </button>
      )}

      {!isGroupCollapsed && (
        <div className="space-y-0.5">
          {group.items.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            const link = (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors",
                  collapsed && "justify-center px-2",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger render={link} />
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }

            return link;
          })}
        </div>
      )}
    </div>
  );
}

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  return (
    <>
      {/* Brand */}
      <div className="flex h-14 items-center gap-2 border-b border-border px-3 shrink-0">
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10">
          <ShieldCheck className="size-4.5 text-primary" />
        </div>
        {!collapsed && (
          <span className="font-semibold text-sm truncate">SUDO Admin</span>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="space-y-4 p-2">
          {filteredNavigation.map((group) => {
            return (
              <NavGroupSection
                key={group.id}
                group={group}
                collapsed={collapsed}
              />
            );
          })}
        </nav>
      </ScrollArea>
    </>
  );
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

  return (
    <aside
      className={cn(
        "hidden sm:flex flex-col h-full border-r border-border bg-card transition-all duration-200 shrink-0",
        sidebarCollapsed ? "w-16" : "w-56",
      )}
    >
      <SidebarContent collapsed={sidebarCollapsed} />

      {/* Dev: 엔티티 추가 바로가기 */}
      {process.env.NODE_ENV === "development" && (
        <div className="border-t border-border p-2 shrink-0">
          <Tooltip>
            <TooltipTrigger
              render={
                <Link
                  href="/dev/entity-generator"
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors",
                    sidebarCollapsed && "justify-center px-2",
                  )}
                >
                  <Plus className="size-4 shrink-0" />
                  {!sidebarCollapsed && <span>엔티티 추가</span>}
                </Link>
              }
            />
            {sidebarCollapsed && (
              <TooltipContent side="right">엔티티 추가</TooltipContent>
            )}
          </Tooltip>
        </div>
      )}

      {/* Collapse toggle */}
      <div className="border-t border-border p-2 shrink-0">
        <button
          type="button"
          onClick={toggleSidebar}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
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

export function MobileSidebar() {
  const { mobileOpen, setMobileOpen } = useUIStore();

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent side="left" className="w-64 p-0" showCloseButton={false}>
        <SheetHeader className="sr-only">
          <SheetTitle>사이드바</SheetTitle>
        </SheetHeader>
        <div className="flex h-full flex-col">
          <SidebarContent collapsed={false} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
