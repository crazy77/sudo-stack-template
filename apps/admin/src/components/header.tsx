"use client";

import { LogOut, Menu, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { useUIStore } from "@/stores/ui-store";

interface HeaderProps {
  userEmail?: string | null;
  userName?: string | null;
}

export function Header({ userEmail, userName }: HeaderProps) {
  const { setMobileOpen } = useUIStore();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <header className="flex items-center h-14 px-4 sm:px-6 border-b border-border bg-background shrink-0 gap-2">
      {/* Mobile sidebar toggle */}
      <Button
        variant="ghost"
        size="icon-sm"
        className="sm:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="size-5" />
      </Button>

      <div className="flex-1" />

      <div className="flex items-center gap-1">
        <ThemeToggle />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors outline-none">
            <div className="flex size-7 items-center justify-center rounded-full bg-primary/10">
              <User className="size-3.5 text-primary" />
            </div>
            <span className="hidden sm:inline max-w-[120px] truncate text-sm">
              {userName || userEmail || "관리자"}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" sideOffset={8}>
            <DropdownMenuLabel>
              <div className="flex flex-col">
                {userName && (
                  <span className="text-sm font-medium">{userName}</span>
                )}
                {userEmail && (
                  <span className="text-xs text-muted-foreground">
                    {userEmail}
                  </span>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="size-4" />
              로그아웃
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
