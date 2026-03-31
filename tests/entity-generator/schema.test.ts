import { describe, expect, it } from "vitest";
import {
  entityDefinitionSchema,
  fieldDefinitionSchema,
} from "@/app/api/dev/generate-entity/schema";

const validField = {
  name: "title",
  columnName: "title",
  label: "제목",
  drizzleType: "text" as const,
  fieldKind: "text" as const,
  required: true,
  showInList: true,
  showInForm: true,
  readonly: false,
  searchable: true,
  filterable: false,
  sortable: true,
};

const validEntity = {
  modelName: "Announcement",
  tableName: "announcements",
  routerKey: "announcements",
  slug: "announcements",
  labelSingular: "공지",
  labelPlural: "공지 목록",
  iconName: "FileText" as const,
  navGroupId: "content",
  fields: [validField],
  listOptions: { showNewButton: true, clickable: true },
  detailOptions: { deletable: true, editable: true },
};

describe("entityDefinitionSchema", () => {
  it("유효한 엔티티 정의를 통과시킨다", () => {
    const result = entityDefinitionSchema.safeParse(validEntity);
    expect(result.success).toBe(true);
  });

  describe("modelName", () => {
    it("PascalCase가 아니면 거부한다", () => {
      const result = entityDefinitionSchema.safeParse({
        ...validEntity,
        modelName: "announcement",
      });
      expect(result.success).toBe(false);
    });

    it("특수문자를 포함하면 거부한다", () => {
      const result = entityDefinitionSchema.safeParse({
        ...validEntity,
        modelName: "Foo_Bar",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("iconName — 코드 인젝션 방지", () => {
    it("COMMON_ICONS에 없는 값을 거부한다", () => {
      const result = entityDefinitionSchema.safeParse({
        ...validEntity,
        iconName: "MaliciousIcon",
      });
      expect(result.success).toBe(false);
    });

    it("코드 인젝션 페이로드를 거부한다", () => {
      const result = entityDefinitionSchema.safeParse({
        ...validEntity,
        iconName: '}; import("child_process").exec("rm -rf /"); const x = {',
      });
      expect(result.success).toBe(false);
    });
  });

  describe("labelSingular/labelPlural — 문자열 인젝션 방지", () => {
    it("따옴표를 포함하면 거부한다", () => {
      const result = entityDefinitionSchema.safeParse({
        ...validEntity,
        labelSingular: '공지"사항',
      });
      expect(result.success).toBe(false);
    });

    it("백틱을 포함하면 거부한다", () => {
      const result = entityDefinitionSchema.safeParse({
        ...validEntity,
        labelPlural: "공지`목록",
      });
      expect(result.success).toBe(false);
    });

    it("백슬래시를 포함하면 거부한다", () => {
      const result = entityDefinitionSchema.safeParse({
        ...validEntity,
        labelSingular: "공지\\사항",
      });
      expect(result.success).toBe(false);
    });

    it("일반 한글 텍스트를 허용한다", () => {
      const result = entityDefinitionSchema.safeParse({
        ...validEntity,
        labelSingular: "공지사항",
        labelPlural: "공지사항 목록",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("navGroupId", () => {
    it("유효한 그룹 ID를 허용한다", () => {
      for (const id of ["main", "content", "system"]) {
        const result = entityDefinitionSchema.safeParse({
          ...validEntity,
          navGroupId: id,
        });
        expect(result.success).toBe(true);
      }
    });

    it("알 수 없는 그룹 ID를 거부한다", () => {
      const result = entityDefinitionSchema.safeParse({
        ...validEntity,
        navGroupId: "unknown",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("slug", () => {
    it("예약된 slug를 거부한다", () => {
      const reserved = ["dashboard", "settings", "login", "api", "dev"];
      for (const slug of reserved) {
        const result = entityDefinitionSchema.safeParse({
          ...validEntity,
          slug,
        });
        expect(result.success).toBe(false);
      }
    });

    it("kebab-case 형식만 허용한다", () => {
      const result = entityDefinitionSchema.safeParse({
        ...validEntity,
        slug: "my_slug",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("fields", () => {
    it("예약된 필드명(id, createdAt, updatedAt)을 거부한다", () => {
      const result = entityDefinitionSchema.safeParse({
        ...validEntity,
        fields: [{ ...validField, name: "id", columnName: "id" }],
      });
      expect(result.success).toBe(false);
    });

    it("빈 필드 배열을 거부한다", () => {
      const result = entityDefinitionSchema.safeParse({
        ...validEntity,
        fields: [],
      });
      expect(result.success).toBe(false);
    });
  });
});

describe("fieldDefinitionSchema", () => {
  it("select 필드에 옵션이 없으면 거부한다", () => {
    const result = fieldDefinitionSchema.safeParse({
      ...validField,
      fieldKind: "select",
      selectOptions: [],
    });
    expect(result.success).toBe(false);
  });

  it("select 필드에 옵션이 있으면 허용한다", () => {
    const result = fieldDefinitionSchema.safeParse({
      ...validField,
      fieldKind: "select",
      selectOptions: [{ value: "draft", label: "초안" }],
    });
    expect(result.success).toBe(true);
  });

  it("fieldName은 camelCase만 허용한다", () => {
    const result = fieldDefinitionSchema.safeParse({
      ...validField,
      name: "my_field",
    });
    expect(result.success).toBe(false);
  });
});
