import type { ColumnDef } from "@tanstack/react-table";
import type { LucideIcon } from "lucide-react";

export type FieldType =
  | { kind: "text" }
  | { kind: "textarea" }
  | { kind: "number" }
  | { kind: "date" }
  | { kind: "datetime" }
  | { kind: "select"; options: { label: string; value: string }[] }
  | { kind: "checkbox" }
  | { kind: "image" }
  | { kind: "url" }
  | { kind: "email" };

export type FieldConfig = {
  name: string;
  label: string;
  type: FieldType;
  readonly?: boolean;
  span?: 1 | 2;
  description?: string;
  placeholder?: string;
};

export type FilterableField = {
  name: string;
  label: string;
  type: "text" | "boolean" | "select";
  options?: { value: string; label: string }[];
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EntityConfig<T = any> = {
  slug: string;
  label: string;
  labelPlural: string;
  icon: LucideIcon;
  columns: ColumnDef<T, unknown>[];

  fields?: FieldConfig[];

  listOptions?: {
    showNewButton?: boolean;
    clickable?: boolean;
  };

  detailOptions?: {
    deletable?: boolean;
    editable?: boolean;
  };

  listMeta?: {
    searchableFields?: string[];
    filterableFields?: FilterableField[];
    defaultSort?: { field: string; order: "asc" | "desc" };
  };
};
