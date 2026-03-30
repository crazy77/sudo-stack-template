# sudo-stack-template

풀스택 모노레포 템플릿. Web, Admin, Mobile을 하나의 레포에서 관리합니다.

## 기술 스택

### 인프라
| 도구 | 역할 |
|------|------|
| [Turborepo](https://turbo.build) | 모노레포 빌드 오케스트레이션 |
| [Bun](https://bun.sh) | 패키지 매니저 |
| [Biome](https://biomejs.dev) | Linter + Formatter |
| [TypeScript](https://www.typescriptlang.org) | 전체 타입 안전성 |

### 앱
| 앱 | 프레임워크 | 용도 |
|----|-----------|------|
| `apps/web` | Next.js 16 (App Router) | 사용자 웹 |
| `apps/admin` | Next.js 16 (App Router) | 백오피스 어드민 |
| `apps/mobile` | Expo 55 + React Native | iOS / Android |
| `apps/api` | Hono + Bun | oRPC HTTP API 서버 |

### 공유 패키지
| 패키지 | 역할 |
|--------|------|
| `@sudo/api` | oRPC 라우터 정의 |
| `@sudo/db` | Drizzle ORM + Supabase 클라이언트 |
| `@sudo/env` | T3 Env 기반 환경변수 검증 |
| `@sudo/validators` | Zod 공유 스키마 |

### 주요 라이브러리
| 분류 | 라이브러리 |
|------|-----------|
| 데이터베이스 | [Supabase](https://supabase.com) + [Drizzle ORM](https://orm.drizzle.team) |
| UI (Web/Admin) | Tailwind CSS v4 + shadcn/ui + Base UI |
| UI (Mobile) | Tailwind CSS v4 + uniwind + react-native-reusables |
| 상태관리 | Jotai (web/mobile), Zustand (admin) |
| 폼 | React Hook Form + Zod |
| 알림 | Sonner (web/admin), Sonner Native (mobile) |
| 애니메이션 | Motion (web/admin), Reanimated (mobile) |
| 인증 | Supabase Auth (Google, Kakao, Apple) |

---

## 시작하기

### 요구사항

- [Bun](https://bun.sh) 1.3.9 이상
- [Node.js](https://nodejs.org) 20 이상
- Xcode (iOS 빌드 시)
- Android Studio (Android 빌드 시)

### 1. 의존성 설치

```bash
bun install
```

### 2. 환경변수 설정

루트에 `.env.local` 생성 (`.env.example` 참고):

```bash
cp .env.example .env.local
```

`.env.local` 값 채우기:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
SUPABASE_SECRET_KEY="sb_secret_..."
DATABASE_URL="postgresql://..."

# API 서버
NEXT_PUBLIC_API_URL="http://localhost:3000"
WEB_URL="http://localhost:3006"
ADMIN_URL="http://localhost:3001"
```

모바일은 `apps/mobile/.env.local` 별도 생성:

```bash
EXPO_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
EXPO_PUBLIC_API_URL="http://localhost:3000"
```

> 키 확인 위치: Supabase 대시보드 → Settings → Data API
> DB URL 확인 위치: Supabase 대시보드 → Connect → ORM → Drizzle

### 3. DB 마이그레이션

```bash
bun db:migrate
```

### 4. 개발 서버 실행

**전체 동시 실행:**
```bash
bun dev
```

**개별 실행:**
```bash
# Web (localhost:3000)
cd apps/web && bun dev

# Admin (localhost:3001)
cd apps/admin && bun dev -- --port 3001

# Mobile
cd apps/mobile && bun start
```

---

## 주요 명령어

```bash
bun dev          # 전체 개발 서버
bun build        # 전체 빌드
bun lint         # 각 앱 ESLint
bun check        # Biome lint + format 자동 수정
bun typecheck    # 전체 타입 체크
bun validate     # check + lint + typecheck 한번에

bun db:generate  # 마이그레이션 파일만 생성 (SQL 검토용)
bun db:migrate   # 마이그레이션 파일 생성 + 실행
bun db:studio    # Drizzle Studio 실행
```

---

## 프로젝트 구조

```
sudo-stack-template/
├── apps/
│   ├── web/          # 사용자 웹 (Next.js App Router)
│   ├── admin/        # 어드민 (Next.js App Router)
│   ├── mobile/       # 모바일 (Expo)
│   └── api/          # oRPC HTTP API 서버 (Hono)
├── packages/
│   ├── api/          # oRPC 라우터 정의
│   ├── db/           # DB 스키마 + 클라이언트
│   ├── env/          # 환경변수 검증
│   └── validators/   # 공유 Zod 스키마
├── doc/
│   ├── oauth/        # 소셜 로그인 설정 가이드
│   └── orpc/         # oRPC 사용 가이드
├── .env.example
└── turbo.json
```

---

## oRPC API

라우터 추가, 사용 패턴, 배포 방법은 아래 문서를 참고하세요.

- [oRPC 사용 가이드](./doc/orpc/README.md)

---

## 소셜 로그인 설정

각 OAuth 제공자 설정 방법은 아래 문서를 참고하세요.

- [전체 개요 + 환경변수](./doc/oauth/README.md)
- [Google 로그인](./doc/oauth/google.md)
- [Kakao 로그인](./doc/oauth/kakao.md)
- [Apple 로그인](./doc/oauth/apple.md) — App Store 심사 필수, 6개월 갱신 주의
