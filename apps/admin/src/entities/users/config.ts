import type { User } from "@sudo/db/schema";
import type { ColumnDef } from "@tanstack/react-table";
import { Users } from "lucide-react";
import type { EntityConfig } from "../types";

const columns: ColumnDef<User, unknown>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ getValue }) => `${String(getValue()).slice(0, 8)}…`,
  },
  {
    accessorKey: "username",
    header: "사용자명",
  },
  {
    accessorKey: "avatarUrl",
    header: "아바타",
    cell: ({ getValue }) => (getValue() as string | null) ?? "—",
  },
  {
    accessorKey: "createdAt",
    header: "가입일",
    cell: ({ getValue }) =>
      new Date(getValue() as Date).toLocaleDateString("ko-KR"),
  },
];

export const usersConfig: EntityConfig<User> = {
  slug: "users",
  label: "사용자",
  labelPlural: "사용자 목록",
  icon: Users,
  columns,
  fields: [
    { name: "username", label: "사용자명", type: { kind: "text" } },
    { name: "avatarUrl", label: "아바타 URL", type: { kind: "url" } },
  ],
  listOptions: {
    clickable: true,
  },
  detailOptions: {
    deletable: false,
    editable: false,
  },
};
