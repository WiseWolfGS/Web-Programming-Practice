# React × Rust WASM × HTML/CSS × Firebase Auth × AWS 배포 — 연습 로드맵

본 문서는 **기본기 연습**을 빠르게 쌓고, 작은 성공을 반복하는 것을 목표로 합니다.
구성: **개발환경 → 디렉토리 구조 → 단계별 실습(수행절차/완료기준) → 테스트/품질 → 배포(AWS) → 체크리스트/트러블슈팅**

---

## 0) 개발 환경

* **Node**: 18+ (권장 20)
* **패키지 매니저**: pnpm (또는 npm/yarn)
* **Rust**: `rustup` + `wasm32-unknown-unknown` 타깃
* **wasm-pack**: `cargo install wasm-pack`
* **에디터**: VS Code + 확장 (Rust Analyzer, ESLint, Prettier)
* **브라우저**: 최신 Chrome/Edge/Firefox

---

## 1) 프로젝트 골격(디렉토리/스캐폴딩)

```bash
pnpm create vite my-wasm-app --template react-ts
cd my-wasm-app
pnpm i
```

**권장 디렉토리 구조**

```
my-wasm-app/
├─ package.json
├─ vite.config.ts
├─ .gitignore
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx
│  ├─ components/         # (선택) UI 컴포넌트
│  └─ wasm/
│     ├─ pkg/             # wasm-pack 산출물(js, d.ts, wasm)
│     └─ index.ts         # WASM 초기화 헬퍼
└─ wasm-core/             # Rust 크레이트 (WASM 대상)
   ├─ Cargo.toml
   └─ src/lib.rs
```

**Rust 크레이트 생성**

```bash
cargo new --lib wasm-core
rustup target add wasm32-unknown-unknown
cargo install wasm-pack
```

**Cargo.toml**

```toml
[package]
name = "wasm_core"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
wasm-bindgen = "0.2"
# (선택) 구조체 직렬화/역직렬화
serde = { version = "1", features = ["derive"] }
serde_wasm_bindgen = "0.6"
```

**src/lib.rs (연습 함수)**

```rust
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn add(a: i32, b: i32) -> i32 {
    a + b
}

#[wasm_bindgen]
pub fn sum_f32(buf: &[f32]) -> f32 {
    buf.iter().sum()
}

#[wasm_bindgen]
pub fn hello(name: &str) -> String {
    format!("Hello, {name} from Rust!")
}
```

**wasm 빌드 산출물을 React로 복사**

```bash
# 루트(my-wasm-app/)에서 실행
wasm-pack build wasm-core --target web --out-dir ./src/wasm/pkg --release
```

**src/wasm/index.ts**

```ts
import init, * as wasm from "./pkg/wasm_core";

let ready: Promise<typeof wasm> | null = null;

export function loadWasm() {
  if (!ready) ready = init().then(() => wasm);
  return ready;
}
```

**src/App.tsx**

```tsx
import { useEffect, useState } from "react";
import { loadWasm } from "./wasm";

export default function App() {
  const [msg, setMsg] = useState("Loading…");

  useEffect(() => {
    loadWasm().then(w => {
      const sum = w.add(21, 21);
      const greet = w.hello("React");
      setMsg(`${greet} | sum=${sum}`);
    });
  }, []);

  return <main style={{ padding: 24 }}><h1>{msg}</h1></main>;
}
```

**npm scripts (package.json)**

```json
{
  "scripts": {
    "build:wasm": "wasm-pack build wasm-core --target web --out-dir ./src/wasm/pkg --release",
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "dev:full": "pnpm build:wasm && pnpm dev"
  }
}
```

---

## 2) 단계별 실습

> 각 단계는 “**수행 절차** → **완료 기준(DoD)** → **심화 과제**” 형식으로 구성합니다.

### 2-1. **Rust WASM ↔ React 기초 연동**

**수행 절차**

1. 위 템플릿으로 빌드/연동 완료.
2. `add`, `sum_f32`, `hello` 호출 로그/화면 출력.
3. `Float32Array` 생성 → `sum_f32`로 합산.

**완료 기준**

* 페이지 로드 후 “Hello, React from Rust! | sum=42”와 유사 메시지 표시.
* 에러 없이 HMR 동작.

**심화 과제**

* `serde_wasm_bindgen`으로 `{id, name, scores:number[]}` 구조체 왕복.
* 큰 배열(≥1e6) 처리 시, JS↔WASM 경계 호출 최소화 실험(배치 처리).

---

### 2-2. **HTML5 + CSS3 최신 기능 연습**

**수행 절차**

1. **Grid/Flex**로 반응형 레이아웃 페이지 1개 제작.
2. **CSS 변수/테마 토글**(Light/Dark) 버튼 추가.
3. **Transition/Keyframe** 애니메이션 1\~2개 적용.
4. **HTML5 요소**: `<details>`, `<dialog>`(또는 `<canvas>`) 중 1개 이상 사용.

**완료 기준**

* 모바일/데스크탑 뷰에서 자연스러운 레이아웃.
* 테마 토글 시 깜빡임 없이 전환.
* 접근성 기본 준수: 시맨틱 태그 사용, 포커스 가능.

**심화 과제**

* Canvas로 간단한 파티클/도형 애니메이션.
* `prefers-color-scheme` 반영 + LocalStorage로 테마 기억.

---

### 2-3. **Firebase Auth(로그인만)**

**수행 절차**

1. Firebase 콘솔에서 프로젝트 생성.
2. **웹 앱 등록** → API 키 등 설정을 `.env`로 관리.
3. 로그인 제공업체 활성화:
   - 이메일/비밀번호
   - Google
4. React에서 Firebase SDK로 인증 기능 구현:
   - 이메일/비밀번호 signIn, signOut
   - Google 계정 signIn (팝업 방식)
5. 로그인 상태에 따라 UI 분기(Protected Route 1개).

**환경 변수 예시 (`.env`)**

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

**초기화 스니펫**

```ts
// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const app = initializeApp({
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
});

export const auth = getAuth(app);
```

**완료 기준**

* 로그인/로그아웃 동작.
* 로그인 필요 페이지 접근 시 미인증 사용자는 리다이렉트.

**심화 과제**

* Social Provider(Google/GitHub) 추가.
* 에러 코드에 따른 토스트 메시지 처리.
* Firebase 콘솔에서 승인 도메인 설정(배포 도메인 포함).

---

### 2-4. **추가 역량 보강(선택)**

* **상태 관리**: `useContext` + `useReducer`로 Auth 전역 상태.
* **비동기 통신**: 무료 API(날씨/환율) 1건 호출 → 카드 UI 표시.
* **TypeScript 심화**: `Pick`/`Omit`/`Partial` 활용 + 컴포넌트 Props 제네릭.
* **테스트**: Jest + React Testing Library로 버튼/라우팅 최소 테스트.

**완료 기준**

* 테스트 3개 이상, CI에서 통과.
* 타입 에러 0, ESLint/Prettier 통일.

---

## 3) 품질/운영

### 3-1. ESLint/Prettier

```bash
pnpm i -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier eslint-config-prettier
```

`.eslintrc.cjs` / `.prettierrc` 구성 → `pnpm lint` 스크립트 추가.

### 3-2. 간단한 테스트

```bash
pnpm i -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

* 예: “로그인 버튼 클릭 시 핸들러 호출”, “라우트 가드 동작”.

### 3-3. 빌드 사이즈/성능

* Vite 기본 코드 스플리팅.
* Rust 쪽은 `--release` 필수, 필요 시 `RUSTFLAGS="-C target-feature=+simd128"`.
* 큰 데이터는 경계 호출 최소화.

---

## 4) AWS 정적 배포(S3 + CloudFront + Route 53 + ACM)

### 4-1. 아키텍처

* **S3 (비공개)**: 정적 파일 원본
* **CloudFront**: CDN + HTTPS + SPA 라우팅
* **ACM(us-east-1)**: 인증서(CloudFront 전용)
* **Route 53(선택)**: ALIAS로 도메인 연결

### 4-2. 빌드 & 업로드

```bash
pnpm build:wasm
pnpm build  # dist/ 생성

# S3 동기화
aws s3 sync dist/ s3://my-wasm-site-prod/ --delete

# WASM MIME 보정(중요)
aws s3 cp s3://my-wasm-site-prod/ s3://my-wasm-site-prod/ \
  --recursive --exclude "*" --include "*.wasm" \
  --content-type "application/wasm" --metadata-directive "REPLACE"
```

### 4-3. CloudFront 설정 포인트

* **Origin**: S3 + **OAC(Origin Access Control)** 연결
* **Default Root Object**: `index.html`
* **SPA 오류 매핑**: 404/403 → `/index.html` 반환(HTTP 200)
* **압축**: ON
* **캐시 정책**:

  * `index.html`: `Cache-Control: no-cache`(또는 짧은 max-age)
  * 해시 파일(`.js`, `.css`, `.wasm`): `max-age=31536000, immutable`
* **응답 헤더 정책(스레드/SharedArrayBuffer 대비)**:

  * `Cross-Origin-Opener-Policy: same-origin`
  * `Cross-Origin-Embedder-Policy: require-corp`
  * `Cross-Origin-Resource-Policy: same-origin`
  * (선택) `X-Content-Type-Options: nosniff`

**캐시 무효화**

```bash
aws cloudfront create-invalidation \
  --distribution-id ABCDEFGHIJKL \
  --paths "/index.html" "/assets/*"
```

### 4-4. S3 버킷 정책(OAC 전용) 샘플

> 콘솔에서 OAC 연결 시 정책 자동 제안이 제공됩니다. 수동 예시는 아래와 유사합니다(배포/OAC ID에 맞게 수정).

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontRead",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::my-wasm-site-prod/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::123456789012:distribution/ABCDEFGHIJKL"
        }
      }
    }
  ]
}
```

### 4-5. GitHub Actions(CI/CD) 예시

```yaml
name: Deploy to AWS
on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - run: pnpm install --frozen-lockfile
      - run: pnpm build:wasm
      - run: pnpm build

      - uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-northeast-2

      - name: Sync to S3
        run: aws s3 sync dist/ s3://my-wasm-site-prod/ --delete

      - name: Ensure WASM MIME
        run: |
          aws s3 cp s3://my-wasm-site-prod/ s3://my-wasm-site-prod/ \
            --recursive --exclude "*" --include "*.wasm" \
            --content-type "application/wasm" --metadata-directive "REPLACE"

      - name: Invalidate CloudFront
        run: aws cloudfront create-invalidation \
          --distribution-id ${{ secrets.CF_DISTRIBUTION_ID }} \
          --paths "/index.html" "/assets/*"
```

**Firebase Auth 도메인 허용**

* Firebase 콘솔 → 인증 → 설정 → 승인 도메인에 **CloudFront 배포 도메인/커스텀 도메인** 추가.

---

## 5) 단계별 완료 체크리스트(압축)

* **WASM 기초**

  * [ ] `wasm-pack` 빌드 성공, React에서 `init()` 정상 호출
  * [ ] `add/sum_f32/hello` 동작, TypedArray 왕복
* **HTML/CSS**

  * [ ] Grid/Flex 반응형 레이아웃
  * [ ] Light/Dark 테마 토글 + CSS 변수
  * [ ] 애니메이션/전환 1개 이상
* **Firebase Auth**

  * [ ] 이메일/비밀번호 로그인/로그아웃
  * [ ] 보호 라우트 1개 이상
  * [ ] (배포 시) 승인 도메인 설정
* **품질**

  * [ ] ESLint/Prettier 통과
  * [ ] 최소 3개 테스트 통과
* **배포**

  * [ ] S3 비공개 + CloudFront OAC
  * [ ] SPA 라우팅(404/403→index.html)
  * [ ] `.wasm` = `application/wasm`
  * [ ] 캐시 정책 분리, 무효화 스크립트 동작

---

## 6) 트러블슈팅 모음

* **WASM 로딩 오류**

  * 증상: “incorrect MIME type” → S3에 `application/wasm`으로 재업로드.
  * 증상: 403/404 → CloudFront OAC/S3 정책/경로 확인.
* **SPA 새로고침 404**

  * CloudFront **Custom Error Response**로 404/403→`/index.html`(200) 설정 누락.
* **SharedArrayBuffer/스레드 관련 에러**

  * COOP/COEP/CORP 응답 헤더 미설정. CloudFront **Response Headers Policy** 적용.
* **Firebase Redirect 실패**

  * 승인 도메인 미등록 또는 OAuth 리디렉션 도메인 불일치.
* **캐시 반영 지연**

  * `index.html` 무효화 필요. 해시된 자원은 무효화 불필요.

---

## 7) 확장/다음 단계(선택)

* **WASM 성능**: SIMD, (필요 시) Web Worker + 메시지 패싱
* **UI 컴포넌트화**: 디자인 시스템 흉내내기(버튼/카드/모달)
* **보안/비용 관리**: AWS Budgets 알림, CloudFront 로그/관측
* **모노레포**: 여러 WASM 크레이트/패키지 관리(변경 영향 최소화)

---

### 최종 메모

이 문서의 순서대로 진행하면, \*\*기본기(연결/표현/인증/배포)\*\*를 작은 범위에서 **끝까지** 경험할 수 있습니다.
중간에 막히면 “완료 기준(DoD)”을 다시 보고 필요한 최소 단위로 쪼개 해결하세요.
