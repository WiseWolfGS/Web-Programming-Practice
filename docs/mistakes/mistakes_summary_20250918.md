# Firebase Google 소셜 로그인 구현 및 디버깅 과정 상세 기록

## 1. 목표

Vite + React + TypeScript 환경에서 Firebase Authentication을 사용하여 Google 소셜 로그인 기능을 구현한다.

---

## 2. 문제 해결 과정 (시간순)

최초 이메일/비밀번호 로그인은 정상적으로 구현된 상태에서 시작, Google 소셜 로그인을 추가하는 과정에서 여러 문제에 부딪혔다.

### 시도 1: `auth/invalid-api-key` 오류 (초기)

- **증상:** 앱 실행 시 `auth/invalid-api-key` 오류 발생.
- **초기 가설:** `.env` 파일의 따옴표 문제.
- **실제 원인:** `firebase.ts` 파일 내 `firebaseConfig` 객체의 `apiKey` 속성명이 `apikey` (소문자 k)로 오타.
- **교훈:** Firebase 설정 객체의 속성명은 대소문자를 정확히 구분해야 한다. (예: `apiKey` vs `apikey`).

### 시도 2: `Cross-Origin-Opener-Policy` 경고 및 팝업 문제 (`signInWithPopup`)

- **증상:** `signInWithPopup` 사용 시 `COOP` 경고 발생. 헤더 추가 후 팝업이 바로 닫힘.
- **초기 가설:** `COOP` 헤더 설정 문제 (`same-origin` vs `same-origin-allow-popups`).
- **실제 원인:** `COEP: require-corp` 헤더가 Google 팝업 내부 리소스 로드를 방해. `signInWithPopup` 자체가 `localhost`와 엄격한 보안 헤더 환경에서 불안정.
- **교훈:** `localhost`에서 `signInWithPopup`과 엄격한 COOP/COEP 헤더를 함께 사용하는 것은 매우 복잡하며, `signInWithRedirect`가 더 권장됨.

### 시도 3: `signInWithRedirect` (리디렉션 방식)로 전환

- **조치:** 복잡한 팝업 관련 정책을 피하기 위해, 페이지 전체를 전환하는 `signInWithRedirect` 방식으로 코드 로직을 변경.
- **현상:** Google 로그인 페이지로 이동 후 다시 앱으로 돌아왔지만, 콘솔에 `GET .../__/firebase/init.json 404 (Not Found)` 오류가 발생하며 로그인되지 않았다.
- **분석:** `signInWithRedirect` 방식은 중간다리 역할의 인증 핸들러 페이지(`__/auth/handler`)를 사용하는데, 이 페이지와 설정 파일(`init.json`)은 **Firebase Hosting** 서비스의 일부. Hosting 서비스가 활성화되지 않아 발생한 문제였다.

### 시도 4: Firebase Hosting 활성화 및 최초 배포

- **조치:**
  1. `firebase init`으로 Hosting 설정을 추가 (`firebase.json` 생성).
  2. `yarn build`로 프로젝트를 빌드.
  3. `firebase deploy --only hosting`으로 빌드된 결과물을 **최초 1회 배포**.
- **현상:** `init.json` 404 오류는 사라졌지만, 여전히 리디렉션 후 로그인이 유지되지 않았다. (오류 없이 로그인 페이지만 다시 보임)
- **분석:** Firebase Hosting 서비스 자체는 활성화되었으나, 인증 정보가 리디렉션 과정에서 유실되고 있었다. 이는 Firebase 설정과 Google Cloud 설정 간의 미세한 불일치 때문일 가능성이 높았다.

### 시도 5: `authDomain` 주소 변경

- **분석:** Firebase 프로젝트는 `[ID].web.app`(최신)과 `[ID].firebaseapp.com`(레거시) 두 개의 도메인을 갖는다. `.env`에 설정된 `authDomain`이 레거시 주소여서, 최신 주소와 도메인이 일치하지 않아 브라우저의 보안 정책에 의해 세션 정보가 유실되는 것으로 가설을 세웠다.
- **조치:** `.env` 파일의 `VITE_FIREBASE_AUTH_DOMAIN`을 `...web.app` 주소로 변경.
- **현상:** Google 로그인 시도 시, `400 redirect_uri_mismatch` 오류 페이지가 표시됨.
- **분석:** `authDomain`을 바꾸자 우리 앱이 요청하는 리디렉션 URI도 `...web.app`으로 바뀌었는데, 정작 Google Cloud의 허용 목록에는 이전의 `...firebaseapp.com` 주소만 등록되어 있어 요청이 거부된 것. 거의 다 왔다는 신호였다.

### 시도 6: Google Cloud 리디렉션 URI 추가

- **조치:** Google Cloud 콘솔의 "OAuth 2.0 클라이언트 ID" 설정에서 "승인된 리디렉션 URI"에 새로운 `...web.app` 주소를 추가.
- **현상:** 여전히 400 오류. 하지만 이번엔 이메일/비밀번호 입력 단계까지는 진행된 후 마지막에 액세스가 차단됨.
- **분석:** 로그를 상세히 분석한 결과, `redirect_uri_mismatch`가 아닌 다른 문제. "**어디로 돌아올 것인가**"(`승인된 리디렉션 URI`)는 해결했지만, "**어디에서 온 요청인가**"(`승인된 JavaScript 출처`)가 아직 해결되지 않았음을 발견.

### 시도 7: Google Cloud JavaScript 출처 추가

- **조치:** Google Cloud 콘솔의 "OAuth 2.0 클라이언트 ID" 설정에서 **"승인된 JavaScript 출처"**에 `http://localhost:5173`을 추가.
- **현상:** **로그인 성공!** 시크릿 모드에서 모든 기능이 정상 동작함을 확인.
- **분석:** `prompt: 'select_account'` 매개변수 추가 후에도 계정 선택 화면이 뜨지 않는 현상 발생. 이는 브라우저 프로필의 Google 세션 상태에 따라 Google이 `prompt` 매개변수를 무시하고 자동 로그인 시도하는 것. 코드 자체는 문제 없음.

### 시도 8: `localhost` HTTPS 환경 구축

- **조치:** `vite-plugin-basic-ssl`을 사용하여 `https://localhost:5173` 환경 구축.
- **현상:** `ERR_SSL_VERSION_OR_CIPHER_MISMATCH` 오류 발생. `basic-ssl` 플러그인 설치 후에도 동일.
- **분석:** `basic-ssl` 플러그인 설치 시 패키지 이름 오타(`vite-plugin-basic-ssl` -> `@vitejs/plugin-basic-ssl`)가 있었음. 올바른 플러그인 설치 후에도 `ERR_SSL_VERSION_OR_CIPHER_MISMATCH` 발생. 이는 `localhost` HTTPS 환경 구축의 어려움.

### 시도 9: `getRedirectResult` `null` 문제 재발 (가장 끈질긴 문제)

- **증상:** `https://localhost:5173` 환경에서 `getRedirectResult`가 `null`을 반환하며 로그인 상태가 유지되지 않음.
- **분석:** `authDomain`을 `localhost`로 변경 시 `ERR_CONNECTION_REFUSED` 발생. `authDomain`을 `proto-ga-life.web.app`으로 되돌리고 `https://localhost:5173`를 '승인된 리디렉션 URI'에 추가했음에도 문제 지속. `persistence` 설정 변경(`browserLocalPersistence`, `browserSessionPersistence`) 및 `setLogLevel` 제거도 효과 없음.
- **실제 원인 (가장 유력):** `localhost` 환경에서 `web.app` 도메인으로부터의 **타사 쿠키(Third-Party Cookie) 차단** 문제. 브라우저가 `web.app`에서 `localhost`로 세션 정보를 전달하는 쿠키를 차단하여 `getRedirectResult`가 세션 정보를 찾지 못하는 것.

---

## 3. 최종 결론 및 권장 사항

Firebase의 `signInWithRedirect` 기능은 코드 자체는 간단하나, `localhost` 개발 환경과 브라우저 보안 정책, Google Cloud 콘솔 설정 간의 복잡한 상호작용 때문에 디버깅이 매우 어려울 수 있다. 문제가 발생하면, 브라우저 콘솔 로그를 면밀히 분석하고, `authDomain`, `redirect_uri`, `origins`의 일치 여부를 프로토콜까지 포함하여 꼼꼼히 확인해야 한다.

**`localhost` 개발 환경에서 `signInWithRedirect`를 사용할 때의 핵심 문제:**

*   **타사 쿠키 차단:** `authDomain` (예: `*.web.app`)과 `redirectUrl` (`localhost`)이 다를 때, 브라우저가 `authDomain`에서 `localhost`로 세션 정보를 전달하는 쿠키를 타사 쿠키로 간주하여 차단할 수 있다. 이것이 `getRedirectResult`가 `null`을 반환하는 가장 흔한 원인이다.
*   **HTTPS 환경 구축의 어려움:** `localhost`에서 안정적인 HTTPS 환경을 구축하는 것이 쉽지 않다. (자체 서명 인증서 문제)

**권장 사항:**

1.  **배포 환경에서 테스트:** `localhost`에서 해결되지 않는 `signInWithRedirect` 문제는 실제 배포 환경(예: Firebase Hosting)에 배포하여 테스트하는 것이 가장 빠르고 확실한 해결책이다. 배포 환경에서는 도메인과 프로토콜이 일치하여 타사 쿠키 문제가 발생하지 않는다.
2.  **`localhost` 개발 시 대안:**
    *   `signInWithPopup`을 사용하되, `vite.config.ts`에서 `Cross-Origin-Opener-Policy: 'same-origin-allow-popups'`를 설정하고 `COEP`는 사용하지 않거나, `localhost`에서만 `COEP`를 비활성화하는 방법을 고려한다.
    *   `firebase serve`와 같은 Firebase CLI의 로컬 에뮬레이터를 사용하여 `localhost` 환경을 Firebase Hosting과 유사하게 만드는 방법도 있다.

이러한 복잡성에도 불구하고, 이 과정을 통해 웹 보안, OAuth 흐름, 브라우저 동작에 대한 깊은 이해를 얻을 수 있었다. 이 경험은 매우 가치 있는 학습이 될 것이다.