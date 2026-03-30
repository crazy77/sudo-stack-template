# Google 로그인 설정

## 1. Google Cloud Console

### 1-1. 프로젝트 생성

1. [console.cloud.google.com](https://console.cloud.google.com) 접속
2. 상단 프로젝트 선택 → **새 프로젝트**
3. 프로젝트 이름 입력 → **만들기**
   - ⚠️ "이 위치에 권한이 없습니다" 오류 시 → 조직을 **"조직 없음"** 으로 변경

### 1-2. OAuth 동의 화면 설정

1. 좌측 메뉴 → **APIs & Services** → **OAuth consent screen**
2. User Type: **External** → 만들기
3. 앱 이름, 사용자 지원 이메일 입력 → 저장 후 계속
4. Scopes: 기본값 유지 → 저장 후 계속
5. Test users: 개발 중 테스트할 계정 추가 (선택) → 저장 후 계속

### 1-3. OAuth Client ID 생성

1. **APIs & Services** → **Credentials**
2. **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Application type: **Web application**
4. **승인된 JavaScript 원본** 추가:
   ```
   http://localhost:3000
   http://localhost:3001
   https://your-production-domain.com
   ```
5. **승인된 리디렉션 URI** 추가:
   ```
   https://xxxx.supabase.co/auth/v1/callback
   http://localhost:54321/auth/v1/callback
   ```
   > `localhost:54321`은 로컬 Supabase(`supabase start`) 사용 시에만 필요
6. **만들기** → **Client ID**와 **Client Secret** 복사

## 2. Supabase 설정

**Authentication** → **Providers** → **Google**

| 항목 | 값 |
|------|------|
| Enable Sign in with Google | ON |
| Client IDs | 위에서 복사한 Client ID |
| Client Secret | 위에서 복사한 Client Secret |
| Skip nonce checks | **ON** (모바일 iOS 지원 필수) |
| Allow users without an email | OFF (Google은 항상 이메일 제공) |

**Save** 클릭

## 3. 모바일 추가 설정

iOS에서 nonce를 제어할 수 없으므로 **Skip nonce checks는 반드시 ON** 유지.

## 주의사항

- JavaScript 원본은 `http://` 스킴 포함 정확히 입력 (끝에 `/` 없음)
- 리디렉션 URI는 Supabase 서버 주소 — 앱 주소(`localhost:3000`) 아님
