import type { Post } from "@sudo/db/schema";
import type { ColumnDef } from "@tanstack/react-table";
import { FileText } from "lucide-react";
import type { EntityConfig } from "../types";

const columns: ColumnDef<Post, any>[] = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ getValue }) => `${String(getValue()).slice(0, 8)}…`,
  },
  {
    accessorKey: "title",
    header: "제목",
  },
  {
    accessorKey: "authorId",
    header: "작성자 ID",
    cell: ({ getValue }) => `${String(getValue()).slice(0, 8)}…`,
  },
  {
    accessorKey: "createdAt",
    header: "생성일",
    cell: ({ getValue }) => new Date(getValue() as Date).toLocaleDateString("ko-KR"),
  },
];

export const postsConfig: EntityConfig<Post> = {
  slug: "posts",
  label: "게시글",
  labelPlural: "게시글 목록",
  icon: FileText,
  columns,
};
