# Apple 로그인 설정

> ⚠️ App Store에 소셜 로그인이 하나라도 있으면 Apple 로그인 필수 (심사 규정)
> ⚠️ Client Secret이 **6개월마다 만료** → 캘린더에 5개월 시점 갱신 알림 필수

## 1. Apple Developer Console

[developer.apple.com](https://developer.apple.com) → **Certificates, Identifiers & Profiles**

### 1-1. App ID에 Sign In with Apple 활성화

1. **Identifiers** → 앱 Bundle ID 선택
2. **Sign In with Apple** 체크 → **Save**

### 1-2. Services ID 생성 (웹 OAuth용)

1. **Identifiers** → **+** → **Services IDs** → Continue
2. 입력:
   - Description: `My App Sign In` (자유)
   - Identifier: `com.yourapp.service`
     - ⚠️ App ID와 동일한 identifier 불가 → 반드시 다른 값 사용 (`.service` 접미사 권장)
3. **Continue** → **Register**
4. 생성된 Services ID 클릭 → **Sign In with Apple 체크** → **Configure**
   - Primary App ID: 앱 선택
   - Domains: `xxxx.supabase.co`
     - ⚠️ `localhost` 불가 — Apple은 로컬 도메인 미지원
   - Return URLs: `https://xxxx.supabase.co/auth/v1/callback`
5. **Save** → **Continue** → **Register**

### 1-3. Private Key 생성

1. **Keys** → **+**
2. Key Name: 자유
3. **Sign In with Apple** 체크 → **Configure**
4. Primary App ID 선택 → **Save**
5. **Register** → **Download** (`.p8` 파일)
   - ⚠️ **딱 한 번만 다운로드 가능** — 분실 시 재생성 필요
   - ⚠️ 파일을 안전한 곳에 보관 (6개월마다 필요)
6. **Key ID** 메모

### 1-4. Team ID 확인

우측 상단 계정명 옆 괄호 안 10자리 문자열
예: `3MHC88UQS4`

## 2. Client Secret (JWT) 생성

Apple의 Client Secret은 `.p8` 파일로 서명한 **JWT**입니다.
Supabase 제공 브라우저 툴로 생성합니다.

1. 아래 링크 접속 (**Chrome 또는 Firefox** — Safari 불가)
   `https://supabase.com/docs/guides/auth/social-login/auth-apple#generate-a-client_secret`

2. 폼 입력:

   | 항목 | 값 |
   |------|------|
   | Team ID | Apple Developer 우측 상단 10자리 |
   | Services ID | `com.yourapp.service` |
   | Key ID | Keys에서 생성한 Key ID |
   | Private Key | `.p8` 파일을 텍스트 편집기로 열어 전체 내용 붙여넣기 (`-----BEGIN PRIVATE KEY-----` 포함) |

3. **Generate** → 생성된 JWT 문자열 복사

> 이 JWT가 Supabase에 입력할 **Client Secret**입니다.
> `.p8` 파일 내용을 그대로 넣으면 안 됩니다.

## 3. Supabase 설정

**Authentication** → **Providers** → **Apple**

| 항목 | 값 |
|------|------|
| Enable Sign in with Apple | ON |
| Client ID (Services ID) | `com.yourapp.service` |
| Secret Key | 위에서 생성한 JWT 문자열 |

**Save** 클릭

## 4. 6개월 갱신 절차

Client Secret JWT는 생성 후 **최대 6개월** 유효합니다.
만료되면 Apple 로그인이 전면 중단됩니다.

갱신 절차:
1. 보관해둔 `.p8` 파일로 위 **2번 과정** 반복
2. 새로 생성된 JWT를 Supabase Apple Provider의 Secret Key에 덮어쓰기
3. Save

**캘린더에 생성일로부터 5개월 시점에 알림 설정 필수**

## 주의사항

- Apple 로그인은 로컬 테스트 불가 (localhost 도메인 미지원)
- 배포 환경에서만 테스트 가능
- `.p8` 파일 분실 시 해당 Key를 Apple Developer에서 Revoke하고 새로 생성 필요
