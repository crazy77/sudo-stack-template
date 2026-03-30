# Kakao 로그인 설정

## 1. Kakao Developers

### 1-1. 앱 생성

1. [developers.kakao.com](https://developers.kakao.com) 접속 → 로그인
2. **내 애플리케이션** → **애플리케이션 추가하기**
3. 앱 이름, 사업자명 입력 → 저장

### 1-2. 플랫폼 등록

앱 선택 → **앱 설정** → **플랫폼**

**Web 플랫폼 등록:**
- 사이트 도메인:
  ```
  http://localhost:3000
  https://your-production-domain.com
  ```

**Android 플랫폼 등록 (모바일 앱 있는 경우):**
- 패키지명: `com.yourapp` (app.json의 android package명)

**iOS 플랫폼 등록 (모바일 앱 있는 경우):**
- 번들 ID: `com.yourapp` (app.json의 ios bundleIdentifier)

### 1-3. 카카오 로그인 활성화

**제품 설정** → **카카오 로그인**

- 활성화 설정: **ON**
- Redirect URI 추가:
  ```
  https://xxxx.supabase.co/auth/v1/callback
  ```

### 1-4. 동의항목 설정

**제품 설정** → **카카오 로그인** → **동의항목**

| 항목 | 설정 | 비고 |
|------|------|------|
| 닉네임 | 필수 동의 | |
| 프로필 사진 | 선택 동의 | |
| 카카오계정(이메일) | 선택 동의 | ⚠️ 사용자가 거부 가능 |

> 이메일은 **선택 동의**만 가능 — 사용자가 거부하면 이메일 없이 가입됨.
> Supabase의 **Allow users without an email → ON** 필수.

### 1-5. Client Secret 생성

**제품 설정** → **카카오 로그인** → **보안**

- 코드 생성 클릭 → Client Secret 복사
- 활성화 상태: **사용함** 으로 변경

### 1-6. REST API 키 확인

**앱 설정** → **앱 키**

- **REST API 키** 복사 (Supabase의 Client ID로 사용)

## 2. Supabase 설정

**Authentication** → **Providers** → **Kakao**

| 항목 | 값 |
|------|------|
| Enable Sign in with Kakao | ON |
| Client ID | Kakao REST API 키 |
| Client Secret | Kakao Client Secret |
| Allow users without an email | **ON** (이메일 거부 사용자 대응) |

**Save** 클릭

## 주의사항

- 카카오 이메일은 선택 동의라 `user.email`이 `null`일 수 있음
- 유저 식별은 `user.email` 대신 `user.id` (Supabase UUID) 사용 권장
- 앱이 검수 전이면 팀원만 테스트 가능 → **카카오 로그인 검수 신청** 필요
