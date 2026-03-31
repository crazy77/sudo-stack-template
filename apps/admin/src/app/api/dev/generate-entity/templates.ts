import type { EntityDefinition, FieldDefinition } from "./schema";
import { DRIZZLE_TO_ZOD } from "./schema";

export function generateDrizzleSchema(def: EntityDefinition): string {
  const drizzleImports = new Set<string>(["pgTable", "uuid", "timestamp"]);
  for (const f of def.fields) {
    drizzleImports.add(f.drizzleType);
  }

  const sortedImports = [...drizzleImports].sort();

  const fieldLines = def.fields.map((f) => {
    let line = `  ${f.name}: ${buildDrizzleColumn(f)}`;
    if (f.required) line += ".notNull()";
    return `${line},`;
  });

  return `import { ${sortedImports.join(", ")} } from "drizzle-orm/pg-core";

export const ${def.tableName} = pgTable("${def.tableName}", {
  id: uuid("id").primaryKey().defaultRandom(),
${fieldLines.join("\n")}
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdateFn(() => new Date()),
});

export type ${def.modelName} = typeof ${def.tableName}.$inferSelect;
export type New${def.modelName} = typeof ${def.tableName}.$inferInsert;
`;
}

function buildDrizzleColumn(f: FieldDefinition): string {
  const col = f.columnName;
  if (f.drizzleType === "timestamp") {
    return `timestamp("${col}", { withTimezone: true })`;
  }
  return `${f.drizzleType}("${col}")`;
}

export function generateORPCRouter(def: EntityDefinition): string {
  const formFields = def.fields.filter((f) => !f.readonly);
  const searchableFields = def.fields.filter((f) => f.searchable);
  const filterableFields = def.fields.filter((f) => f.filterable);
  const sortableFields = def.fields.filter((f) => f.sortable);
  const sortableNames = ["createdAt", ...sortableFields.map((f) => f.name)];

  // import 구성
  const drizzleOrmImports = ["eq", "gt", "lt"];
  if (searchableFields.length > 0) drizzleOrmImports.push("ilike", "or");
  if (filterableFields.length > 0 || searchableFields.length > 0)
    drizzleOrmImports.push("and");
  drizzleOrmImports.push("asc", "desc");
  const uniqueImports = [...new Set(drizzleOrmImports)].sort();

  // create input
  const createFields = formFields.map((f) => {
    const zodType = DRIZZLE_TO_ZOD[f.drizzleType];
    return `      ${f.name}: ${zodType}${f.required ? "" : ".optional()"},`;
  });

  // update input
  const updateFields = formFields.map((f) => {
    const zodType = DRIZZLE_TO_ZOD[f.drizzleType];
    return `      ${f.name}: ${zodType}.optional(),`;
  });

  // sortBy enum
  const sortByEnum = sortableNames.map((n) => `"${n}"`).join(", ");

  // filter input fields
  const filterZodFields = filterableFields.map((f) => {
    const zodType = DRIZZLE_TO_ZOD[f.drizzleType];
    return `        ${f.name}: ${zodType}.optional(),`;
  });

  // search where 조건
  const searchCondition =
    searchableFields.length > 0
      ? `
      // 검색
      if (search) {
        conditions.push(
          or(
${searchableFields.map((f) => `            ilike(${def.tableName}.${f.name}, \`%\${search}%\`)`).join(",\n")}
          )!
        );
      }`
      : "";

  // filter where 조건
  const filterConditions =
    filterableFields.length > 0
      ? `
      // 필터
      if (filters) {
${filterableFields
  .map(
    (f) =>
      `        if (filters.${f.name} !== undefined) conditions.push(eq(${def.tableName}.${f.name}, filters.${f.name}));`,
  )
  .join("\n")}
      }`
      : "";

  const authImport =
    def.authLevel === "managersOnly"
      ? `import { managersOnly } from "../middlewares/auth";`
      : `import { authed } from "../middlewares/auth";`;
  const base = def.authLevel === "managersOnly" ? "managersOnly" : "authed";

  return `import { ORPCError } from "@orpc/server";
import { ${uniqueImports.join(", ")} } from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { db } from "@sudo/db/client";
import { ${def.tableName} } from "@sudo/db/schema";
import { z } from "zod";
${authImport}

export const ${def.routerKey}Router = ${base}.router({
  list: ${base}
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().uuid().optional(),
        sortBy: z.enum([${sortByEnum}]).default("createdAt"),
        sortOrder: z.enum(["asc", "desc"]).default("desc"),
        search: z.string().optional(),${
          filterableFields.length > 0
            ? `
        filters: z
          .object({
${filterZodFields.join("\n")}
          })
          .optional(),`
            : ""
        }
      })
    )
    .handler(async ({ input${def.authLevel === "ownerOnly" ? ", context" : ""} }) => {
      const { limit, cursor, sortBy, sortOrder, search${filterableFields.length > 0 ? ", filters" : ""} } = input;
      const conditions: SQL[] = [];

      if (cursor) {
        conditions.push(
          sortOrder === "desc"
            ? lt(${def.tableName}.id, cursor)
            : gt(${def.tableName}.id, cursor)
        );
      }
${searchCondition}${filterConditions}

      const orderFn = sortOrder === "asc" ? asc : desc;
      const items = await db
        .select()
        .from(${def.tableName})
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(orderFn(${def.tableName}[sortBy]))
        .limit(limit + 1);

      const hasMore = items.length > limit;
      const data = hasMore ? items.slice(0, limit) : items;
      const nextCursor = hasMore && data.length > 0 ? data[data.length - 1].id : undefined;

      return { data, nextCursor, hasMore };
    }),

  getById: ${base}
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input }) => {
      const [item] = await db
        .select()
        .from(${def.tableName})
        .where(eq(${def.tableName}.id, input.id))
        .limit(1);
      return item ?? null;
    }),

  create: ${base}
    .input(
      z.object({
${createFields.join("\n")}
      })
    )
    .handler(async ({ input${def.authLevel === "ownerOnly" ? ", context" : ""} }) => {
      const [created] = await db
        .insert(${def.tableName})
        .values(input)
        .returning();
      return created;
    }),

  update: ${base}
    .input(
      z.object({
        id: z.string().uuid(),
${updateFields.join("\n")}
      })
    )
    .handler(async ({ input${def.authLevel === "ownerOnly" ? ", context" : ""} }) => {
      const { id, ...data } = input;
${
  def.authLevel === "ownerOnly"
    ? `      // ownerOnly: 단일 쿼리로 소유권 검증 + 업데이트
      const [updated] = await db
        .update(${def.tableName})
        .set(data)
        .where(and(eq(${def.tableName}.id, id), eq(${def.tableName}.authorId, context.userId)))
        .returning();
      if (!updated) throw new ORPCError("FORBIDDEN", { message: "본인 작성 항목만 수정할 수 있습니다" });`
    : `      const [updated] = await db
        .update(${def.tableName})
        .set(data)
        .where(eq(${def.tableName}.id, id))
        .returning();
      if (!updated) throw new ORPCError("NOT_FOUND", { message: "항목을 찾을 수 없습니다" });`
}
      return updated;
    }),

  delete: ${base}
    .input(z.object({ id: z.string().uuid() }))
    .handler(async ({ input${def.authLevel === "ownerOnly" ? ", context" : ""} }) => {
${
  def.authLevel === "ownerOnly"
    ? `      // ownerOnly: 단일 쿼리로 소유권 검증 + 삭제
      const deleted = await db
        .delete(${def.tableName})
        .where(and(eq(${def.tableName}.id, input.id), eq(${def.tableName}.authorId, context.userId)))
        .returning({ id: ${def.tableName}.id });
      if (deleted.length === 0) throw new ORPCError("FORBIDDEN", { message: "본인 작성 항목만 삭제할 수 있습니다" });`
    : `      await db
        .delete(${def.tableName})
        .where(eq(${def.tableName}.id, input.id));`
}
      return { success: true };
    }),
});
`;
}

export function generateEntityConfig(def: EntityDefinition): string {
  const listFields = def.fields.filter((f) => f.showInList);
  const formFields = def.fields.filter((f) => f.showInForm);
  const searchableFields = def.fields.filter((f) => f.searchable);
  const filterableFields = def.fields.filter((f) => f.filterable);

  // 컬럼 정의
  const columnDefs = [
    `  {
    accessorKey: "id",
    header: "ID",
    cell: ({ getValue }) => \`\${String(getValue()).slice(0, 8)}…\`,
  }`,
    ...listFields.map((f) => buildColumnDef(f)),
    `  {
    accessorKey: "createdAt",
    header: "생성일",
    cell: ({ getValue }) =>
      new Date(getValue() as Date).toLocaleDateString("ko-KR"),
  }`,
  ];

  // 필드 정의
  const fieldDefs = formFields.map((f) => {
    const nameStr = JSON.stringify(f.name);
    const labelStr = JSON.stringify(f.label);

    let typeStr = `{ kind: "${f.fieldKind}" }`;
    if (f.fieldKind === "select" && f.selectOptions?.length) {
      const optionsStr = f.selectOptions
        .map(
          (o) =>
            `{ value: ${JSON.stringify(o.value)}, label: ${JSON.stringify(o.label)} }`,
        )
        .join(", ");
      typeStr = `{ kind: "select", options: [${optionsStr}] }`;
    }

    const extras = [f.readonly && "readonly: true", f.span === 2 && "span: 2"]
      .filter(Boolean)
      .join(", ");

    return `    { name: ${nameStr}, label: ${labelStr}, type: ${typeStr}${extras ? `, ${extras}` : ""} }`;
  });

  // listMeta
  let listMetaBlock = "";
  if (searchableFields.length > 0 || filterableFields.length > 0) {
    const parts: string[] = [];
    if (searchableFields.length > 0) {
      parts.push(
        `    searchableFields: [${searchableFields.map((f) => `"${f.name}"`).join(", ")}]`,
      );
    }
    if (filterableFields.length > 0) {
      const filterDefs = filterableFields.map((f) => {
        const filterType =
          f.drizzleType === "boolean"
            ? "boolean"
            : f.fieldKind === "select"
              ? "select"
              : "text";
        let fd = `      { name: ${JSON.stringify(f.name)}, label: ${JSON.stringify(f.label)}, type: "${filterType}"`;
        if (filterType === "select" && f.selectOptions) {
          fd += `, options: [${f.selectOptions.map((o) => `{ value: ${JSON.stringify(o.value)}, label: ${JSON.stringify(o.label)} }`).join(", ")}]`;
        }
        fd += " }";
        return fd;
      });
      parts.push(`    filterableFields: [\n${filterDefs.join(",\n")}\n    ]`);
    }
    parts.push(`    defaultSort: { field: "createdAt", order: "desc" }`);
    listMetaBlock = `
  listMeta: {
${parts.join(",\n")},
  },`;
  }

  return `import type { ${def.modelName} } from "@sudo/db/schema";
import type { ColumnDef } from "@tanstack/react-table";
import { ${def.iconName} } from "lucide-react";
import type { EntityConfig } from "../types";

const columns: ColumnDef<${def.modelName}, unknown>[] = [
${columnDefs.join(",\n")},
];

export const ${def.routerKey}Config: EntityConfig<${def.modelName}> = {
  slug: ${JSON.stringify(def.slug)},
  label: ${JSON.stringify(def.labelSingular)},
  labelPlural: ${JSON.stringify(def.labelPlural)},
  icon: ${def.iconName},
  columns,
  fields: [
${fieldDefs.join(",\n")},
  ],
  listOptions: {
    clickable: ${def.listOptions.clickable},
    showNewButton: ${def.listOptions.showNewButton},
  },
  detailOptions: {
    deletable: ${def.detailOptions.deletable},
    editable: ${def.detailOptions.editable},
  },${listMetaBlock}
};
`;
}

function buildColumnDef(f: FieldDefinition): string {
  const headerStr = JSON.stringify(f.label);
  if (f.drizzleType === "uuid") {
    return `  {
    accessorKey: "${f.name}",
    header: ${headerStr},
    cell: ({ getValue }) => \`\${String(getValue()).slice(0, 8)}…\`,
  }`;
  }
  if (f.drizzleType === "timestamp") {
    return `  {
    accessorKey: "${f.name}",
    header: ${headerStr},
    cell: ({ getValue }) =>
      new Date(getValue() as Date).toLocaleDateString("ko-KR"),
  }`;
  }
  if (f.drizzleType === "boolean") {
    return `  {
    accessorKey: "${f.name}",
    header: ${headerStr},
    cell: ({ getValue }) => (getValue() ? "예" : "아니오"),
  }`;
  }
  return `  {
    accessorKey: "${f.name}",
    header: ${headerStr},
  }`;
}

export function generateListPage(def: EntityDefinition): string {
  const hasFilters = def.fields.some((f) => f.filterable);
  const filterableFields = def.fields.filter((f) => f.filterable);

  // 필터 파싱 코드
  let filtersParsing = "";
  if (hasFilters) {
    const filterEntries = filterableFields.map((f) => {
      if (f.drizzleType === "boolean") {
        return `      ${f.name}: params.${f.name} === "true" ? true : params.${f.name} === "false" ? false : undefined,`;
      }
      if (f.drizzleType === "integer") {
        return `      ${f.name}: params.${f.name} ? Number(params.${f.name}) : undefined,`;
      }
      return `      ${f.name}: params.${f.name} || undefined,`;
    });
    filtersParsing = `
    filters: {
${filterEntries.join("\n")}
    },`;
  }

  return `import { EntityListView } from "@/features/crud/entity-list-view";
import { createServerClient } from "@/lib/orpc/server";

interface PageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function ${def.modelName}sPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const client = await createServerClient();
  const result = await client.${def.routerKey}.list({
    limit: params.limit ? Number(params.limit) : 20,
    cursor: params.cursor,
    sortBy: params.sortBy ?? "createdAt",
    sortOrder: (params.sortOrder as "asc" | "desc") ?? "desc",
    search: params.search,${filtersParsing}
  });

  return (
    <EntityListView
      entity="${def.routerKey}"
      initialData={result.data}
      pagination={{ nextCursor: result.nextCursor, hasMore: result.hasMore }}
    />
  );
}
`;
}

export function generateDetailPage(def: EntityDefinition): string {
  return `import { ${def.routerKey}Config } from "@/entities/${def.routerKey}/config";
import { EntityDetailView } from "@/features/crud/entity-detail-view";
import { createServerClient } from "@/lib/orpc/server";
import { notFound } from "next/navigation";

export default async function ${def.modelName}DetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await createServerClient();
  const item = await client.${def.routerKey}.getById({ id });

  if (!item) notFound();

  return (
    <EntityDetailView
      config={${def.routerKey}Config}
      data={item as unknown as Record<string, unknown>}
    />
  );
}
`;
}
