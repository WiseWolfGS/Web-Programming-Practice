# 프로젝트 초기 설정 실수 및 해결 과정 (2025-09-17)

이 문서는 React + Rust WASM 프로젝트의 초기 설정 과정에서 발생했던 주요 실수들과 그 해결책, 그리고 각 과정에서 얻은 교훈을 정리합니다.

---

## 1. 주요 실수 및 해결 과정

### 1.1. 프로젝트 초기 구조 설정 오류 (가장 큰 문제)

-   **실수:** 로드맵의 첫 단계인 `yarn create vite my-wasm-app --template react-ts` 명령어를 실행하지 않고, 수동으로 폴더를 만들고 파일을 배치하려 했습니다. 이로 인해 `App.tsx`, `node_modules`, `index.html`, `main.tsx` 등의 핵심 파일들이 잘못된 위치에 있거나 누락되었습니다.
-   **해결:** 기존의 잘못된 `my-wasm-app` 폴더를 삭제하고, `yarn create vite` 명령어를 다시 실행하여 올바른 프로젝트 구조를 생성했습니다. 이후 `wasm-core` 폴더를 새로 생성된 `my-wasm-app` 안으로 이동시키고, 모든 관련 파일을 로드맵에 따라 재배치했습니다.
-   **교훈:** 항상 공식 스캐폴딩 도구(예: `create-vite`)를 사용하여 기본 구조를 생성해야 합니다. 이는 프로젝트의 일관성과 도구 호환성을 보장하는 가장 기본적인 단계입니다.

### 1.2. `Cargo.toml`의 의존성 이름 오타

-   **실수:** `Cargo.toml` 파일에서 `serde-wasm-bindgen` (하이픈)으로 작성해야 하는데, 이를 `serde_wasm_bindgen` (언더스코어)으로 혼동했습니다.
-   **해결:** `Cargo.toml`에서 의존성 이름을 `serde-wasm-bindgen`으로 수정했습니다.
-   **교훈:** Rust 크레이트의 이름은 `crates.io`에 등록된 이름과 정확히 일치해야 합니다. 하이픈과 언더스코어의 차이에 주의해야 합니다.

### 1.3. `rust-analyzer` 오류 및 VS Code 워크스페이스 루트 문제

-   **실수:** VS Code를 프로젝트의 실제 루트 폴더(`my-wasm-app`)가 아닌 상위 폴더(`WASM_Example`)에서 열었습니다. 이로 인해 `rust-analyzer`가 Rust 워크스페이스를 제대로 인식하지 못하는 `FetchWorkspaceError`가 발생했습니다.
-   **해결:** VS Code를 `my-wasm-app` 폴더를 루트로 하여 다시 열었습니다.
-   **교훈:** VS Code와 같은 IDE는 프로젝트의 루트 폴더에서 열려야 언어 서버 및 기타 도구들이 올바르게 작동합니다.

### 1.4. `App.tsx`의 임포트 경로 오류 및 `@types/react` 누락

-   **실수:** `App.tsx` 파일이 잘못된 위치에 있었고, `node_modules`도 최상위 폴더에 있어 `react`와 같은 패키지를 상대 경로로 임포트하려 했습니다. 또한 TypeScript 프로젝트에서 `react` 라이브러리의 타입 정의(`@types/react`)를 설치하지 않았습니다.
-   **해결:** `App.tsx`를 `my-wasm-app/src/App.tsx`로 이동시키고, `yarn install`을 `my-wasm-app`에서 실행하여 `node_modules`를 올바른 위치에 생성했습니다. `App.tsx`의 임포트 경로를 `import { loadWasm } from "./wasm";`로 수정하고, `yarn add --dev @types/react`를 실행하여 타입 정의를 설치했습니다.
-   **교훈:** 올바른 프로젝트 구조에서는 설치된 패키지(`react`)는 직접 이름으로 임포트하고, 로컬 모듈은 상대 경로로 임포트합니다. TypeScript 프로젝트에서는 JavaScript 라이브러리의 타입 정의를 위해 `@types/` 패키지를 설치해야 합니다.

### 1.5. `wasm-pack build` 출력 경로 문제

-   **실수:** `my-wasm-app/wasm-core/src` 폴더 안에 `wasm`이라는 불필요한 폴더가 존재하여 `wasm-pack`이 `--out-dir` 옵션을 무시하고 `pkg` 폴더를 `wasm-core` 내부에 생성했습니다. `wasm-pack`의 상대 경로 해석 방식에 대한 오해가 있었습니다.
-   **해결:** `my-wasm-app/wasm-core/src/wasm` 폴더를 삭제하고, `my-wasm-app/package.json`의 `build:wasm` 스크립트에서 `--out-dir`에 명확한 상대 경로(`./src/wasm/pkg`)를 지정했습니다.
-   **교훈:** Rust 크레이트의 `src` 폴더는 `lib.rs`와 같은 소스 파일만 포함해야 합니다. `wasm-pack`의 `--out-dir` 옵션은 실행 위치를 기준으로 해석되므로, `package.json` 스크립트에서 실행될 때의 경로를 정확히 인지하고 지정해야 합니다.

### 1.6. `#[wasm_bindgen]` 매크로 누락 (가장 결정적인 오류)

-   **실수:** Rust 함수를 JavaScript로 노출하기 위해 필수적인 `#[wasm_bindgen]` 매크로를 함수 위에 추가하지 않았습니다. 이를 주석으로 착각했습니다. 이로 인해 `w.add is not a function`과 같은 오류가 발생했습니다.
-   **해결:** `lib.rs` 파일의 `add`, `sum_f32`, `hello` 함수 위에 `#[wasm_bindgen]` 매크로를 추가했습니다.
-   **교훈:** `#[wasm_bindgen]` 매크로는 `wasm-bindgen`이 Rust 함수에 대한 JavaScript 바인딩 코드를 생성하는 데 필수적인 지시자입니다. Rust의 속성(attribute) 문법에 대한 이해가 필요합니다.

### 1.7. 중첩된 Git 저장소 문제

-   **실수:** `cargo new` 명령어가 기본적으로 `.git` 폴더를 생성하여 `my-wasm-app` Git 저장소 안에 `wasm-core`라는 또 다른 Git 저장소가 중첩되었습니다. 이로 인해 `git add .` 명령이 실패했습니다.
-   **해결:** `my-wasm-app/wasm-core/.git` 폴더를 삭제했습니다.
-   **교훈:** Git 저장소 안에 또 다른 Git 저장소를 포함할 때는 `git submodule`을 사용하거나, 의도하지 않았다면 내부 `.git` 폴더를 삭제해야 합니다.

---

## 2. 결론

이러한 실수들을 통해 프로젝트 구조의 중요성, 도구들의 작동 방식, 그리고 각 기술 스택의 기본적인 규칙들을 깊이 있게 이해할 수 있었습니다. 이 경험이 앞으로의 학습에 큰 도움이 될 것입니다.
