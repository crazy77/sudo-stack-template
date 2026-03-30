# oRPC 사용 가이드

이 템플릿의 API 레이어는 [oRPC](https://orpc.unnoq.com)를 사용합니다.

## 아키텍처

```
packages/api/        ← 라우터 정의 (단 한 곳)
    ↓
apps/api/            ← Hono HTTP 서버 (모바일 + 클라이언트용)
    ↓
apps/mobile/         → HTTP 경유
apps/web/            → 클라이언트 컴포넌트: HTTP 경유
                     → Server Actions / RSC: 직접 import
apps/admin/          → 클라이언트 컴포넌트: HTTP 경유
                     → Server Actions / RSC: 직접 import
```

**원칙: 네트워크 경계가 있으면 HTTP, 없으면 직접 호출**

---

## 환경변수

루트 `.env.local`:
```bash
# API 서버 URL (apps/api)
NEXT_PUBLIC_API_URL="http://localhost:3000"   # web/admin에서 브라우저가 직접 호출
WEB_URL="http://localhost:3006"               # API 서버 CORS 허용 출처
ADMIN_URL="http://localhost:3001"             # API 서버 CORS 허용 출처
```

`apps/mobile/.env.local`:
```bash
EXPO_PUBLIC_API_URL="http://localhost:3000"
```

---

## 라우터 추가

`packages/api/src/routers/` 에 파일 추가 후 `router.ts`에 등록:

```typescript
// packages/api/src/routers/comments.ts
import { os } from "@orpc/server";

export const commentsRouter = os.router({
  list: os.handler(async () => { ... }),
});

// packages/api/src/router.ts
import { commentsRouter } from "./routers/comments.js";

export const appRouter = os.router({
  posts: postsRouter,
  comments: commentsRouter,  // 추가
});
```

인증이 필요한 프로시저는 `authedMiddleware` 사용:

```typescript
import { authedMiddleware } from "../middlewares/auth.js";

export const commentsRouter = os.router({
  create: os
    .use(authedMiddleware)
    .input(z.object({ postId: z.string(), body: z.string() }))
    .handler(async ({ input, context }) => {
      // context.userId 사용 가능
    }),
});
```

---

## 사용 패턴

### Web / Admin — Server Component, Server Action

```typescript
import { createServerOrpc } from "@/lib/orpc.server";

// Server Component
export default async function PostsPage() {
  const orpc = await createServerOrpc();
  const posts = await orpc.posts.list({});
  return <PostList posts={posts} />;
}

// Server Action
"use server";
export async function createPost(input: CreatePostInput) {
  const orpc = await createServerOrpc();
  return orpc.posts.create(input);
}
```

### Web / Admin — Client Component

```typescript
"use client";
import { orpc } from "@/lib/orpc";

// 직접 호출
const posts = await orpc.posts.list.call({});
```

### Mobile

```typescript
import { orpc } from "@/lib/orpc";

const posts = await orpc.posts.list.call({});
```

---

## apps/api 로컬 실행

```bash
cd apps/api && bun dev   # http://localhost:3000
```

헬스체크:
```bash
curl http://localhost:3000/health
# {"status":"ok"}
```

---

## 배포

`apps/api`는 Vercel에 별도 프로젝트로 배포합니다.

```
Vercel 프로젝트
├── sudo-stack-web    → apps/web
├── sudo-stack-admin  → apps/admin
└── sudo-stack-api    → apps/api   ← Hono (hono/vercel 어댑터)
```

Railway 이전이 필요한 경우 `apps/api/src/index.ts`의 Bun 서버를 그대로 사용하고 Vercel 관련 파일(`api/index.ts`, `vercel.json`)만 제거하면 됩니다.
