import { z } from "zod";

// --- Zod Schemas ---

export const selectOptionSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1),
});

export const fieldDefinitionSchema = z
  .object({
    name: z
      .string()
      .min(1)
      .regex(/^[a-z][a-zA-Z0-9]*$/, "camelCase 형식이어야 합니다"),
    columnName: z
      .string()
      .min(1)
      .regex(/^[a-z][a-z0-9_]*$/, "snake_case 형식이어야 합니다"),
    label: z.string().min(1),
    drizzleType: z.enum([
      "text",
      "integer",
      "boolean",
      "timestamp",
      "uuid",
      "json",
    ]),
    fieldKind: z.enum([
      "text",
      "textarea",
      "number",
      "date",
      "datetime",
      "select",
      "checkbox",
      "image",
      "url",
      "email",
    ]),
    required: z.boolean(),
    showInList: z.boolean(),
    showInForm: z.boolean(),
    readonly: z.boolean(),
    searchable: z.boolean(),
    filterable: z.boolean(),
    sortable: z.boolean(),
    span: z.union([z.literal(1), z.literal(2)]).optional(),
    selectOptions: z.array(selectOptionSchema).optional(),
  })
  .refine(
    (f) =>
      f.fieldKind !== "select" ||
      (f.selectOptions && f.selectOptions.length > 0),
    { message: "select 타입 필드는 최소 1개의 옵션이 필요합니다" },
  );

const RESERVED_FIELD_NAMES = ["id", "createdAt", "updatedAt"];

const RESERVED_SLUGS = [
  "dashboard",
  "settings",
  "login",
  "api",
  "dev",
  "auth",
  "posts",
  "users",
  "managers",
];

export const entityDefinitionSchema = z.object({
  modelName: z
    .string()
    .min(1)
    .regex(/^[A-Z][a-zA-Z]*$/, "PascalCase 형식이어야 합니다"),
  tableName: z
    .string()
    .min(1)
    .regex(/^[a-z][a-z0-9_]*$/, "snake_case 형식이어야 합니다"),
  routerKey: z
    .string()
    .min(1)
    .regex(/^[a-z][a-zA-Z0-9]*$/, "camelCase 형식이어야 합니다"),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z][a-z0-9-]*$/, "kebab-case 형식이어야 합니다")
    .refine((s: string) => !RESERVED_SLUGS.includes(s), "예약된 slug입니다"),
  labelSingular: z.string().min(1),
  labelPlural: z.string().min(1),
  iconName: z.string().min(1),
  navGroupId: z.string().min(1),
  fields: z
    .array(fieldDefinitionSchema)
    .min(1, "최소 1개의 필드가 필요합니다")
    .refine(
      (fields) => fields.every((f) => !RESERVED_FIELD_NAMES.includes(f.name)),
      {
        message: "id, createdAt, updatedAt는 예약된 필드명입니다 (자동 생성됨)",
      },
    ),
  listOptions: z.object({
    showNewButton: z.boolean(),
    clickable: z.boolean(),
  }),
  detailOptions: z.object({
    deletable: z.boolean(),
    editable: z.boolean(),
  }),
});

// --- TypeScript Types ---

export type SelectOption = z.infer<typeof selectOptionSchema>;
export type FieldDefinition = z.infer<typeof fieldDefinitionSchema>;
export type EntityDefinition = z.infer<typeof entityDefinitionSchema>;

// --- Constants ---

/** drizzleType → 기본 fieldKind 매핑 */
export const DRIZZLE_TO_FIELD_KIND: Record<
  FieldDefinition["drizzleType"],
  FieldDefinition["fieldKind"]
> = {
  text: "text",
  integer: "number",
  boolean: "checkbox",
  timestamp: "datetime",
  uuid: "text",
  json: "textarea",
};

/** drizzleType → 필드 리스트 속성 기본값 */
export const DRIZZLE_FIELD_DEFAULTS: Record<
  FieldDefinition["drizzleType"],
  { searchable: boolean; filterable: boolean; sortable: boolean }
> = {
  text: { searchable: true, filterable: false, sortable: true },
  integer: { searchable: false, filterable: true, sortable: true },
  boolean: { searchable: false, filterable: true, sortable: false },
  timestamp: { searchable: false, filterable: false, sortable: true },
  uuid: { searchable: false, filterable: false, sortable: false },
  json: { searchable: false, filterable: false, sortable: false },
};

/** drizzleType → Zod 스키마 문자열 */
export const DRIZZLE_TO_ZOD: Record<FieldDefinition["drizzleType"], string> = {
  text: "z.string()",
  integer: "z.number().int()",
  boolean: "z.boolean()",
  timestamp: "z.string().datetime()",
  uuid: "z.string().uuid()",
  json: "z.unknown()",
};

/** 자주 쓰는 Lucide 아이콘 목록 */
export const COMMON_ICONS = [
  "Activity",
  "AlertCircle",
  "Archive",
  "BarChart",
  "Bell",
  "Bookmark",
  "BookOpen",
  "Calendar",
  "CheckCircle",
  "Clipboard",
  "Clock",
  "CreditCard",
  "Database",
  "FileText",
  "Flag",
  "Folder",
  "Globe",
  "Grid",
  "Heart",
  "Image",
  "Layers",
  "Link",
  "List",
  "Lock",
  "Mail",
  "MapPin",
  "Megaphone",
  "MessageSquare",
  "Package",
  "Phone",
  "PieChart",
  "Settings",
  "Shield",
  "ShoppingCart",
  "Star",
  "Tag",
  "TrendingUp",
  "Users",
  "Wrench",
  "Zap",
] as const;

/** 네비게이션 그룹 옵션 (navigation.ts에서 파생) */
import { navigation } from "@/config/navigation";
export const NAV_GROUPS = navigation.map((g) => ({
  value: g.id,
  label: g.heading,
}));
