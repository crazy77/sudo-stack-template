import type { ColumnDef } from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";

export type EntityConfig<T> = {
  slug: string;
  label: string;
  labelPlural: string;
  icon: LucideIcon;
  columns: ColumnDef<T, any>[];
};
