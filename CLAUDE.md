@AGENTS.md

# sudo-stack-template

Turbo 모노레포 기반 풀스택 템플릿.

## 기술 스택

- **런타임**: Bun
- **프론트**: Next.js 16 (admin, web), React Native/Expo (mobile)
- **API**: oRPC (`packages/api`)
- **DB**: Drizzle ORM + PostgreSQL (`packages/db`)
- **인증**: Supabase Auth
- **린트/포맷**: Biome
- **테스트**: Vitest

## 주요 명령어

```bash
bun run dev           # 전체 개발 서버
bun run validate      # biome check + lint + typecheck
bun run test          # vitest 실행
bun run db:generate   # Drizzle 스키마 생성
bun run db:migrate    # DB 마이그레이션
```

## 프로젝트 구조

```
apps/
  admin/     # 어드민 대시보드 (Next.js)
  web/       # 공개 웹사이트 (Next.js)
  api/       # API 서버
  mobile/    # 모바일 앱 (Expo)
packages/
  api/       # oRPC 라우터 정의 + 클라이언트
  db/        # Drizzle 스키마 + 클라이언트
  env/       # 환경변수 스키마
  validators/ # 공유 검증 로직
```

## 엔티티 추가 방법

### 자동 (코드 생성기)

개발 환경에서 `/dev/entity-generator` 페이지 접속 → GUI 폼으로 엔티티 정의 → 자동 생성:
- `packages/db/src/schema/{table}.ts` — Drizzle 스키마
- `packages/api/src/routers/{key}.ts` — oRPC CRUD 라우터
- `apps/admin/src/entities/{key}/config.ts` — EntityConfig
- `apps/admin/src/app/(admin)/{slug}/page.tsx` — 목록 페이지
- `apps/admin/src/app/(admin)/{slug}/[id]/page.tsx` — 상세 페이지

생성 후 `bun run db:generate && bun run db:migrate` 실행 필요.

### 수동

1. `packages/db/src/schema/` 에 Drizzle 테이블 정의 → `schema/index.ts`에 export 추가
2. `packages/api/src/routers/` 에 oRPC 라우터 작성 → `router.ts`에 등록
3. `apps/admin/src/entities/` 에 EntityConfig 작성 → `registry.ts`에 등록
4. `apps/admin/src/config/navigation.ts` 에 네비 항목 추가
5. `apps/admin/src/app/(admin)/` 에 페이지 컴포넌트 작성

## 어드민 CRUD 프레임워크

- `EntityConfig` (`entities/types.ts`): 엔티티별 컬럼, 필드, 옵션 설정
- `EntityListView` (`features/crud/`): 서버사이드 페이지네이션, 검색, 필터
- `EntityDetailView` (`features/crud/`): 상세/수정/삭제 뷰
- 공통 UI: `components/admin-ui/` (PageContainer, PageHeader, SectionCard 등)

## dev-only 도구

`/dev/` 경로 하위는 `NODE_ENV !== "development"` 가드로 보호됨. 프로덕션 빌드에서 접근 불가.
