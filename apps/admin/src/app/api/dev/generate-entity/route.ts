import fs from "node:fs/promises";
import path from "node:path";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  getMonorepoRoot,
  modifyAppRouter,
  modifyEntityRegistry,
  modifyNavigation,
  modifySchemaIndex,
} from "./modifiers";
import { entityDefinitionSchema } from "./schema";
import {
  generateDetailPage,
  generateDrizzleSchema,
  generateEntityConfig,
  generateListPage,
  generateORPCRouter,
} from "./templates";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  // 1. Dev-only 가드
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json(
      { error: "이 API는 개발 환경에서만 사용 가능합니다" },
      { status: 403 },
    );
  }

  // 2. 입력 파싱 + 검증
  let def;
  try {
    const body = await request.json();
    def = entityDefinitionSchema.parse(body);
  } catch (error) {
    return NextResponse.json(
      {
        error: "입력 검증 실패",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 400 },
    );
  }

  // 3. 경로 계산
  const root = await getMonorepoRoot();
  const newFiles = [
    {
      label: "Drizzle 스키마",
      path: path.join(root, `packages/db/src/schema/${def.tableName}.ts`),
      content: generateDrizzleSchema(def),
    },
    {
      label: "oRPC 라우터",
      path: path.join(root, `packages/api/src/routers/${def.routerKey}.ts`),
      content: generateORPCRouter(def),
    },
    {
      label: "EntityConfig",
      path: path.join(
        root,
        `apps/admin/src/entities/${def.routerKey}/config.ts`,
      ),
      content: generateEntityConfig(def),
    },
    {
      label: "목록 페이지",
      path: path.join(root, `apps/admin/src/app/(admin)/${def.slug}/page.tsx`),
      content: generateListPage(def),
    },
    {
      label: "상세 페이지",
      path: path.join(
        root,
        `apps/admin/src/app/(admin)/${def.slug}/[id]/page.tsx`,
      ),
      content: generateDetailPage(def),
    },
  ];

  // 4. 충돌 체크 (병렬)
  const conflicts = await Promise.all(
    newFiles.map(async (file) => {
      try {
        await fs.access(file.path);
        return path.relative(root, file.path);
      } catch {
        return null;
      }
    }),
  );
  const conflictFile = conflicts.find(Boolean);
  if (conflictFile) {
    return NextResponse.json(
      { error: `이미 존재하는 파일: ${conflictFile}` },
      { status: 409 },
    );
  }

  // 5. 파일 생성 + 수정 (롤백 지원)
  const createdFiles: string[] = [];
  const originalContents: { path: string; content: string }[] = [];

  try {
    // 5-1. 새 파일 생성
    for (const file of newFiles) {
      await fs.mkdir(path.dirname(file.path), { recursive: true });
      await fs.writeFile(file.path, file.content, "utf-8");
      createdFiles.push(file.path);
    }

    // 5-2. 기존 파일 수정 (원본 백업 후 수정)
    const modTargets = [
      path.join(root, "packages/db/src/schema/index.ts"),
      path.join(root, "packages/api/src/router.ts"),
      path.join(root, "apps/admin/src/entities/registry.ts"),
      path.join(root, "apps/admin/src/config/navigation.ts"),
    ];

    const originals = await Promise.all(
      modTargets.map(async (target) => ({
        path: target,
        content: await fs.readFile(target, "utf-8"),
      })),
    );
    originalContents.push(...originals);

    const modifiedFiles: string[] = [];
    modifiedFiles.push(await modifySchemaIndex(def.tableName));
    modifiedFiles.push(await modifyAppRouter(def.routerKey));
    modifiedFiles.push(await modifyEntityRegistry(def.routerKey));
    modifiedFiles.push(await modifyNavigation(def));

    // 6. 성공 응답
    return NextResponse.json({
      success: true,
      created: createdFiles.map((f) => path.relative(root, f)),
      modified: modifiedFiles.map((f) => path.relative(root, f)),
      nextSteps: [
        "bun run db:generate",
        "bun run db:migrate",
        "dev 서버 재시작 (자동 HMR이 안 될 수 있음)",
      ],
    });
  } catch (error) {
    // 롤백: 생성한 파일 삭제
    for (const filePath of createdFiles) {
      try {
        await fs.unlink(filePath);
      } catch {
        // 삭제 실패는 무시
      }
    }
    // 롤백: 수정한 파일 원복
    for (const { path: filePath, content } of originalContents) {
      try {
        await fs.writeFile(filePath, content, "utf-8");
      } catch {
        // 원복 실패는 무시
      }
    }

    return NextResponse.json(
      {
        error: "파일 생성 중 오류 발생 (롤백 완료)",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
