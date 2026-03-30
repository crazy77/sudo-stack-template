"use client";

import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="flex items-center h-14 px-6 border-b border-border bg-background shrink-0">
      <div className="flex-1" />
      <ThemeToggle />
    </header>
  );
}
