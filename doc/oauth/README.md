# 소셜 로그인 설정 가이드

Supabase 기반 OAuth 설정 절차 문서입니다.

## 지원 제공자

| 제공자 | 문서 | 비고 |
|--------|------|------|
| Google | [google.md](./google.md) | |
| Kakao | [kakao.md](./kakao.md) | 이메일 미제공 가능 |
| Apple | [apple.md](./apple.md) | App Store 심사 필수, 6개월 갱신 필요 |

## 최종 env 설정

설정 완료 후 루트 `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
SUPABASE_SECRET_KEY="sb_secret_..."
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres"
```

`apps/mobile/.env.local`:

```bash
EXPO_PUBLIC_SUPABASE_URL="https://xxxx.supabase.co"
EXPO_PUBLIC_SUPABASE_ANON_KEY="sb_publishable_..."
```

## Supabase API 키 위치

대시보드 → 좌측 사이드바 **Settings** → **Data API** → **API Keys** 탭

**Publishable and secret API keys** 탭 선택 (Legacy anon/service_role 탭 아님)

| 변수 | 섹션 | 키 형식 |
|------|------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | 같은 페이지 상단 **Project URL** | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | **Publishable key** 섹션 | `sb_publishable_...` |
| `SUPABASE_SECRET_KEY` | **Secret keys** 섹션 → 눈 아이콘 클릭해서 Reveal | `sb_secret_...` |

> ⚠️ `SUPABASE_SECRET_KEY`는 절대 클라이언트(브라우저/앱)에 노출 금지 — 서버 전용

## DATABASE_URL 위치

대시보드 상단 **Connect** 버튼 클릭

1. **ORM** 탭 선택
2. **Drizzle** 선택
3. 표시된 URL 복사 - [YOUR-PASSWORD] -> 비밀번호로 교체

> 비밀번호를 잊었다면: **Settings** → **Database** → **Reset database password**

## Supabase AI Agent Skills

```bash
npx skills add supabase/agent-skills
```