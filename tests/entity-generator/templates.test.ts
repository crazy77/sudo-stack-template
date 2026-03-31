import { describe, expect, it } from "vitest";
import type { EntityDefinition } from "@/app/api/dev/generate-entity/schema";
import {
  generateDetailPage,
  generateDrizzleSchema,
  generateEntityConfig,
  generateListPage,
  generateORPCRouter,
} from "@/app/api/dev/generate-entity/templates";

const baseDef: EntityDefinition = {
  modelName: "Announcement",
  tableName: "announcements",
  routerKey: "announcements",
  slug: "announcements",
  labelSingular: "공지",
  labelPlural: "공지 목록",
  iconName: "Megaphone",
  navGroupId: "content",
  fields: [
    {
      name: "title",
      columnName: "title",
      label: "제목",
      drizzleType: "text",
      fieldKind: "text",
      required: true,
      showInList: true,
      showInForm: true,
      readonly: false,
      searchable: true,
      filterable: false,
      sortable: true,
    },
    {
      name: "isPublished",
      columnName: "is_published",
      label: "공개 여부",
      drizzleType: "boolean",
      fieldKind: "checkbox",
      required: true,
      showInList: true,
      showInForm: true,
      readonly: false,
      searchable: false,
      filterable: true,
      sortable: false,
    },
  ],
  listOptions: { showNewButton: true, clickable: true },
  detailOptions: { deletable: true, editable: true },
  authLevel: "managersOnly" as const,
};

describe("generateDrizzleSchema", () => {
  it("올바른 Drizzle 스키마를 생성한다", () => {
    const result = generateDrizzleSchema(baseDef);

    expect(result).toContain('from "drizzle-orm/pg-core"');
    expect(result).toContain("pgTable");
    expect(result).toContain(`export const announcements = pgTable(`);
    expect(result).toContain('id: uuid("id").primaryKey().defaultRandom()');
    expect(result).toContain('title: text("title").notNull()');
    expect(result).toContain('isPublished: boolean("is_published").notNull()');
    expect(result).toContain("createdAt:");
    expect(result).toContain("updatedAt:");
  });

  it("타입 export를 포함한다", () => {
    const result = generateDrizzleSchema(baseDef);
    expect(result).toContain("export type Announcement =");
    expect(result).toContain("export type NewAnnouncement =");
  });

  it("필드의 drizzleType에 맞는 import를 생성한다", () => {
    const result = generateDrizzleSchema(baseDef);
    expect(result).toMatch(
      /import \{.*boolean.*\} from "drizzle-orm\/pg-core"/,
    );
    expect(result).toMatch(/import \{.*text.*\} from "drizzle-orm\/pg-core"/);
  });
});

describe("generateORPCRouter", () => {
  it("CRUD 라우터를 생성한다", () => {
    const result = generateORPCRouter(baseDef);

    expect(result).toContain("export const announcementsRouter = os.router({");
    expect(result).toContain("list:");
    expect(result).toContain("getById:");
    expect(result).toContain("create:");
    expect(result).toContain("update:");
    expect(result).toContain("delete:");
  });

  it("검색 가능 필드에 대한 ilike 조건을 포함한다", () => {
    const result = generateORPCRouter(baseDef);
    expect(result).toContain("ilike(announcements.title");
  });

  it("필터 가능 필드에 대한 eq 조건을 포함한다", () => {
    const result = generateORPCRouter(baseDef);
    expect(result).toContain("filters.isPublished");
  });
});

describe("generateEntityConfig", () => {
  it("EntityConfig를 생성한다", () => {
    const result = generateEntityConfig(baseDef);

    expect(result).toContain("export const announcementsConfig");
    expect(result).toContain('slug: "announcements"');
    expect(result).toContain('label: "공지"');
    expect(result).toContain('labelPlural: "공지 목록"');
    expect(result).toContain("icon: Megaphone");
  });

  it("목록 컬럼에 showInList 필드만 포함한다", () => {
    const result = generateEntityConfig(baseDef);
    expect(result).toContain('accessorKey: "title"');
    expect(result).toContain('accessorKey: "isPublished"');
  });
});

describe("generateListPage", () => {
  it("서버 컴포넌트 페이지를 생성한다", () => {
    const result = generateListPage(baseDef);

    expect(result).toContain("export default async function");
    expect(result).toContain("EntityListView");
    expect(result).toContain('entity="announcements"');
    expect(result).toContain("client.announcements.list");
  });
});

describe("generateDetailPage", () => {
  it("상세 페이지를 생성한다", () => {
    const result = generateDetailPage(baseDef);

    expect(result).toContain("export default async function");
    expect(result).toContain("EntityDetailView");
    expect(result).toContain("announcementsConfig");
    expect(result).toContain("client.announcements.getById");
    expect(result).toContain("notFound()");
  });
});
