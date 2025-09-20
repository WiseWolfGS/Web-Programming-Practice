# Firebase Google 소셜 로그인 문제 해결 과정 상세 기록

## 1. 목표

Vite + React + TypeScript 환경에서 Firebase Authentication을 사용하여 Google 소셜 로그인 기능을 구현한다.

---

## 2. 문제 해결 과정 (시간순)

최초 이메일/비밀번호 로그인은 정상적으로 구현된 상태에서 시작, Google 소셜 로그인을 추가하는 과정에서 여러 문제에 부딪혔다.

### 시도 1: `signInWithPopup` (팝업 방식)

- **현상:** 기능은 정상 동작했지만, 브라우저 콘솔에 `Cross-Origin-Opener-Policy` (COOP) 관련 경고가 계속 표시되었다.
- **분석:** 브라우저의 기본 정책이 앱(localhost)과 Google 로그인 팝업(google.com) 간의 직접적인 상호작용(`window.closed` 확인 등)을 제한하기 때문에 경고 발생. 하지만 Firebase SDK 내부의 폴백(Fallback) 메커니즘 덕분에 기능 자체는 동작했다.

### 시도 2: COOP 헤더 추가 (`same-origin`)

- **조치:** 경고를 없애기 위해 `vite.config.ts`에 `Cross-Origin-Opener-Policy: 'same-origin'` 헤더를 추가.
- **현상:** Google 로그인 팝업이 뜨자마자 바로 닫히며 로그인이 완전히 실패했다.
- **분석:** `'same-origin'` 정책은 "오직 동일한 출처의 창하고만 소통하겠다"는 매우 강력한 규칙. 교차 출처인 Google 팝업창과의 모든 소통이 차단되어 발생한 문제였다.

### 시도 3: COOP 헤더 변경 (`same-origin-allow-popups`)

- **조치:** `'same-origin'` 대신, "내가 연 팝업과는 소통을 허용하겠다"는 `'same-origin-allow-popups'`으로 정책을 완화.
- **현상:** 여전히 팝업이 바로 닫히며 실패. 문제는 COOP만이 아니었다.
- **분석:** 함께 설정했던 `Cross-Origin-Embedder-Policy: 'require-corp'` (COEP) 정책이 문제. 이 정책은 페이지에 삽입되는 모든 리소스(스크립트, iframe 등)가 특정 응답 헤더를 갖도록 강제하는데, Google 팝업창 내부에서 로드되는 일부 리소스가 이 조건을 만족시키지 못해 팝업 자체가 깨진 것으로 추정.

### 시도 4: `signInWithRedirect` (리디렉션 방식)로 전환

- **조치:** 복잡한 팝업 관련 정책을 피하기 위해, 페이지 전체를 전환하는 `signInWithRedirect` 방식으로 코드 로직을 변경.
- **현상:** Google 로그인 페이지로 이동 후 다시 앱으로 돌아왔지만, 콘솔에 `GET .../__/firebase/init.json 404 (Not Found)` 오류가 발생하며 로그인되지 않았다.
- **분석:** `signInWithRedirect` 방식은 중간다리 역할의 인증 핸들러 페이지(`__/auth/handler`)를 사용하는데, 이 페이지와 설정 파일(`init.json`)은 **Firebase Hosting** 서비스의 일부. Hosting 서비스가 활성화되지 않아 발생한 문제였다.

### 시도 5: Firebase Hosting 활성화 및 최초 배포

- **조치:**
  1. `firebase init`으로 Hosting 설정을 추가 (`firebase.json` 생성).
  2. `yarn build`로 프로젝트를 빌드.
  3. `firebase deploy --only hosting`으로 빌드된 결과물을 **최초 1회 배포**.
- **현상:** `init.json` 404 오류는 사라졌지만, 여전히 리디렉션 후 로그인이 유지되지 않았다. (오류 없이 로그인 페이지만 다시 보임)
- **분석:** Firebase Hosting 서비스 자체는 활성화되었으나, 인증 정보가 리디렉션 과정에서 유실되고 있었다. 이는 Firebase 설정과 Google Cloud 설정 간의 미세한 불일치 때문일 가능성이 높았다.

### 시도 6: `authDomain` 주소 변경

- **분석:** Firebase 프로젝트는 `[ID].web.app`(최신)과 `[ID].firebaseapp.com`(레거시) 두 개의 도메인을 갖는다. `.env`에 설정된 `authDomain`이 레거시 주소여서, 최신 주소와 도메인이 일치하지 않아 브라우저의 보안 정책에 의해 세션 정보가 유실되는 것으로 가설을 세웠다.
- **조치:** `.env` 파일의 `VITE_FIREBASE_AUTH_DOMAIN`을 `...web.app` 주소로 변경.
- **현상:** Google 로그인 시도 시, `400 redirect_uri_mismatch` 오류 페이지가 표시됨.
- **분석:** `authDomain`을 바꾸자 우리 앱이 요청하는 리디렉션 URI도 `...web.app`으로 바뀌었는데, 정작 Google Cloud의 허용 목록에는 이전의 `...firebaseapp.com` 주소만 등록되어 있어 요청이 거부된 것. 거의 다 왔다는 신호였다.

### 시도 7: Google Cloud 리디렉션 URI 추가

- **조치:** Google Cloud 콘솔의 "OAuth 2.0 클라이언트 ID" 설정에서 "승인된 리디렉션 URI"에 새로운 `...web.app` 주소를 추가.
- **현상:** 여전히 400 오류. 하지만 이번엔 이메일/비밀번호 입력 단계까지는 진행된 후 마지막에 액세스가 차단됨.
- **분석:** 로그를 상세히 분석한 결과, `redirect_uri_mismatch`가 아닌 다른 문제. "**어디로 돌아올 것인가**"(`승인된 리디렉션 URI`)는 해결했지만, "**어디에서 온 요청인가**"(`승인된 JavaScript 출처`)가 아직 해결되지 않았음을 발견.

### 시도 8: Google Cloud JavaScript 출처 추가 (최종 해결)

- **조치:** Google Cloud 콘솔의 "OAuth 2.0 클라이언트 ID" 설정에서 **"승인된 JavaScript 출처"**에 `http://localhost:5173`을 추가.
- **현상:** **로그인 성공!** 시크릿 모드에서 모든 기능이 정상 동작함을 확인.

---

## 3. 최종 결론 및 올바른 설정 요약

Firebase의 `signInWithRedirect` 기능은 코드뿐만 아니라, **Firebase Hosting**과 **Google Cloud Console**의 여러 설정들이 유기적으로 맞물려 동작한다. 문제가 발생했을 때, 다음 세 가지를 모두 점검해야 한다.

1.  **Firebase 프로젝트 설정:**
    -   `Authentication`: 사용할 소셜 로그인(Google 등) 제공업체가 활성화되어야 한다.
    -   `Hosting`: 서비스가 활성화되어 있어야 하며, **최소 1회 이상 배포**가 완료되어 `__/auth/handler` 인프라가 준비되어야 한다.

2.  **Google Cloud 콘솔 설정 (`APIs & Services > Credentials > OAuth 2.0 Client IDs`):**
    -   **`승인된 JavaScript 출처`**: 개발 환경의 주소(`http://localhost:5173` 등)가 반드시 포함되어야 한다.
    -   **`승인된 리디렉션 URI`**: Firebase의 `authDomain`과 일치하는 핸들러 주소(`https://[ID].web.app/__/auth/handler`)가 포함되어야 한다.

3.  **로컬 프로젝트 설정 (`.env`):**
    -   `VITE_FIREBASE_AUTH_DOMAIN`: Firebase Hosting의 여러 도메인 중, Google Cloud에 등록된 리디렉션 URI와 일치하는 **최신 `...web.app` 주소**를 사용해야 한다.
