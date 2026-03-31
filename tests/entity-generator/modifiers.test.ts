import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// modifiers.ts는 getMonorepoRoot에서 turbo.json을 찾으므로
// 테스트용 임시 디렉토리에 turbo.json을 생성하여 우회
let tmpDir: string;

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "entity-gen-test-"));
  await fs.writeFile(path.join(tmpDir, "turbo.json"), "{}", "utf-8");

  // modifiers.ts가 process.cwd()에서 turbo.json을 찾으므로 cwd를 변경
  vi.spyOn(process, "cwd").mockReturnValue(tmpDir);

  // cachedRoot 초기화를 위해 모듈 캐시 제거
  vi.resetModules();
});

afterEach(async () => {
  vi.restoreAllMocks();
  await fs.rm(tmpDir, { recursive: true, force: true });
});

describe("modifySchemaIndex", () => {
  it("export 문을 정렬하여 추가한다", async () => {
    // Setup
    const schemaDir = path.join(tmpDir, "packages/db/src/schema");
    await fs.mkdir(schemaDir, { recursive: true });
    await fs.writeFile(
      path.join(schemaDir, "index.ts"),
      'export * from "./posts";\nexport * from "./users";\n',
      "utf-8",
    );

    const { modifySchemaIndex } = await import(
      "@/app/api/dev/generate-entity/modifiers"
    );
    await modifySchemaIndex("announcements");

    const content = await fs.readFile(
      path.join(schemaDir, "index.ts"),
      "utf-8",
    );
    expect(content).toContain('export * from "./announcements"');
    // 정렬 확인
    const lines = content.trim().split("\n");
    expect(lines[0]).toContain("announcements");
    expect(lines[1]).toContain("posts");
    expect(lines[2]).toContain("users");
  });

  it("이미 존재하는 export는 에러를 던진다", async () => {
    const schemaDir = path.join(tmpDir, "packages/db/src/schema");
    await fs.mkdir(schemaDir, { recursive: true });
    await fs.writeFile(
      path.join(schemaDir, "index.ts"),
      'export * from "./announcements";\n',
      "utf-8",
    );

    const { modifySchemaIndex } = await import(
      "@/app/api/dev/generate-entity/modifiers"
    );
    await expect(modifySchemaIndex("announcements")).rejects.toThrow(
      "이미",
    );
  });
});

describe("modifyAppRouter", () => {
  it("라우터에 import와 항목을 추가한다", async () => {
    const routerDir = path.join(tmpDir, "packages/api/src");
    await fs.mkdir(routerDir, { recursive: true });
    await fs.writeFile(
      path.join(routerDir, "router.ts"),
      `import { os } from "@orpc/server";
import { postsRouter } from "./routers/posts";

export const appRouter = os.router({
  posts: postsRouter,
});
`,
      "utf-8",
    );

    const { modifyAppRouter } = await import(
      "@/app/api/dev/generate-entity/modifiers"
    );
    await modifyAppRouter("announcements");

    const content = await fs.readFile(
      path.join(routerDir, "router.ts"),
      "utf-8",
    );
    expect(content).toContain(
      'import { announcementsRouter } from "./routers/announcements"',
    );
    expect(content).toContain("announcements: announcementsRouter,");
  });
});

describe("modifyNavigation", () => {
  it("아이콘 import와 네비게이션 항목을 추가한다", async () => {
    const configDir = path.join(tmpDir, "apps/admin/src/config");
    await fs.mkdir(configDir, { recursive: true });
    await fs.writeFile(
      path.join(configDir, "navigation.ts"),
      `import {
  FileText,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";

export const navigation = [
  {
    id: "content",
    heading: "콘텐츠",
    items: [
      { id: "posts", label: "게시글", href: "/posts", icon: FileText },
    ],
  },
];
`,
      "utf-8",
    );

    const { modifyNavigation } = await import(
      "@/app/api/dev/generate-entity/modifiers"
    );
    await modifyNavigation({
      modelName: "Announcement",
      tableName: "announcements",
      routerKey: "announcements",
      slug: "announcements",
      labelSingular: "공지",
      labelPlural: "공지 목록",
      iconName: "Megaphone",
      navGroupId: "content",
      fields: [],
      listOptions: { showNewButton: true, clickable: true },
      detailOptions: { deletable: true, editable: true },
    } as any);

    const content = await fs.readFile(
      path.join(configDir, "navigation.ts"),
      "utf-8",
    );
    expect(content).toContain("Megaphone");
    expect(content).toContain('label: "공지"');
    expect(content).toContain('href: "/announcements"');
  });
});
