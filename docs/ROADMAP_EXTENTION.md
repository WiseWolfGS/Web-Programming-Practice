기존 **React × Rust WASM × HTML/CSS × Firebase Auth × AWS 배포** 로드맵과 이어지는 \*\*“확장 목표”\*\*로 **WSL2 & Docker 실습 로드맵**을 별도의 문서 형식으로 정리한 문서입니다.

---

# 🐧⚓ WSL2 & Docker 실습 로드맵

**(기존 로드맵 확장 목표)**

이 문서는 기존 학습 로드맵(React × Rust WASM × HTML/CSS × Firebase Auth × AWS 배포)을 기반으로, **개발 환경과 배포 기술의 확장**을 목표로 합니다.
즉, 단순히 앱을 만들고 배포하는 수준을 넘어, \*\*리눅스 환경 이해(WSL2)\*\*와 \*\*컨테이너 기반 이식성(Docker)\*\*까지 다루어 “실무 환경에 가까운 감각”을 익히는 것이 목적입니다.

---

## 🎯 학습 목표

1. **WSL2**

   * Windows 환경에서 리눅스 개발 환경을 구축하고 익숙해지기.
   * Rust / Node / AWS CLI / Firebase CLI 등을 리눅스에서 직접 다뤄보기.
   * VSCode Remote WSL로 코드 편집 환경 최적화.

2. **Docker**

   * React × Rust WASM 앱을 컨테이너 이미지로 빌드/실행.
   * 정적 웹사이트용 Nginx 컨테이너 구성.
   * Firebase Emulator나 CI/CD 환경에서의 Docker 활용까지 연습.

---

## 🐧 Part 1. WSL2 학습

### 1) 설치 및 준비

* Windows 기능에서 **WSL2 활성화**, Ubuntu 설치.
* `wsl --install -d Ubuntu` (Windows 11 기준).
* 패키지 업데이트:

  ```bash
  sudo apt update && sudo apt upgrade -y
  ```

### 2) 개발 환경 구축

* Rust 설치:

  ```bash
  curl https://sh.rustup.rs -sSf | sh
  rustup target add wasm32-unknown-unknown
  ```
* Node & pnpm 설치:

  ```bash
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
  corepack enable
  ```
* AWS CLI & Firebase CLI:

  ```bash
  sudo apt install unzip -y
  curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
  unzip awscliv2.zip && sudo ./aws/install
  npm install -g firebase-tools
  ```

### 3) 실습 과제

* **Rust WASM 빌드**: WSL2에서 `wasm-pack build` 실행.
* **React Dev 서버 실행**: `pnpm dev` → 브라우저에서 정상 동작 확인.
* **AWS CLI 연습**: `aws s3 ls` → 계정과 연결 성공.
* **Firebase CLI 연습**: `firebase login` 후 `firebase emulators:start`.

**완료 기준**

* Windows와 동일하게 빌드 및 실행 성공.
* VSCode Remote WSL로 무리 없이 개발 가능.

---

## ⚓ Part 2. Docker 학습

### 1) 설치

* WSL2 안에 Docker Desktop 연동 or WSL2 native docker 설치.
* 확인:

  ```bash
  docker --version
  docker run hello-world
  ```

### 2) React × Rust WASM 앱 컨테이너화

* 프로젝트 루트에 **Dockerfile** 작성:

```dockerfile
FROM node:20-bullseye as builder
WORKDIR /app
COPY . .
RUN corepack enable && pnpm install && pnpm build:wasm && pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

* 빌드 및 실행:

  ```bash
  docker build -t my-wasm-app .
  docker run -p 8080:80 my-wasm-app
  ```
* 브라우저 접속 → `http://localhost:8080`에서 SPA 확인.

### 3) 확장 과제

* **Firebase Emulator**를 Docker 컨테이너로 실행:

  * `firebase emulators:start` 대신 공식 이미지나 Dockerfile 구성.
* **멀티 컨테이너 환경**: docker-compose로 `app + firebase-emulator` 동시에 실행.
* **CI/CD 실습**: GitHub Actions에서 `docker build` 및 컨테이너 실행 테스트.

**완료 기준**

* Docker에서 React WASM 앱이 정상 서비스됨.
* Firebase Emulator를 컨테이너에서 구동해 로그인 테스트 가능.

---

## 🚀 Part 3. 백엔드 및 고급 기능 확장

이 파트는 단순한 정적 웹앱을 넘어, 데이터를 저장하고 동적으로 상호작용하는 백엔드 시스템과 고급 WASM 기능을 통합하는 것을 목표로 합니다.

### 1) 데이터베이스 연동 (SQLite & PostgreSQL)

*   **목표**: 시뮬레이션 결과(세대별 세포 수, 유전자 분포 등)를 데이터베이스에 저장하고 분석할 기반을 마련합니다.
*   **학습 내용**:
    *   **SQLite**: 로컬 개발 환경에서 가볍게 사용하며, 파일 기반 데이터베이스의 기본 CRUD 작업을 익힙니다.
    *   **PostgreSQL**: Docker를 활용하여 프로덕션 환경과 유사한 관계형 데이터베이스를 구축하고, 더 복잡한 쿼리와 데이터 모델링을 연습합니다.
*   **실습 과제**:
    *   Rust에서 `sqlx` 또는 `diesel` 크레이트를 사용하여 DB와 상호작용하는 코드 작성.
    *   NestJS 백엔드에서 `TypeORM` 등을 통해 DB에 시뮬레이션 로그를 저장하는 API 구현.

### 2) NestJS 백엔드 구축

*   **목표**: 프론트엔드와 동일하게 TypeScript를 사용하여 일관성 있는 풀스택 개발 환경을 구축하고, 간단한 API 서버를 구현합니다.
*   **학습 내용**:
    *   NestJS의 기본 구조(모듈, 컨트롤러, 서비스) 이해.
    *   RESTful API 엔드포인트 설계 및 구현.
    *   프론트엔드(React)와 백엔드 간의 데이터 통신(CORS 처리 포함).
*   **실습 과제**:
    *   시뮬레이션 설정(파라미터)을 저장하고 불러오는 API 구현.
    *   사용자별 시뮬레이션 결과를 DB에 기록하는 API 구현 (Firebase Auth와 연계).

### 3) Rhai 스크립팅 엔진 연동 (WASM 고급)

*   **목표**: Rust/WASM 코어에 스크립팅 언어인 **Rhai**를 내장하여, 사용자가 웹 UI에서 직접 시뮬레이션의 핵심 로직(예: 생존/탄생 공식)을 수정할 수 있는 동적인 환경을 제공합니다.
*   **학습 내용**:
    *   Rust 애플리케이션에 Rhai 엔진을 통합하는 방법.
    *   Rust 함수를 Rhai 스크립트에서 호출할 수 있도록 등록.
    *   WASM 환경에서 스크립트 실행 시의 성능 및 보안 고려사항 학습.
*   **실습 과제**:
    *   `p_live`, `p_born` 계산 공식을 문자열로 받아 Rhai로 실행하는 함수를 WASM으로 노출.
    *   React UI에 `<textarea>`를 추가하여 사용자가 직접 스크립트를 작성하고, 시뮬레이션에 즉시 반영하는 기능 구현.

---

## 🔗 기존 로드맵과의 연결

*   **기존 단계 (React × Rust WASM → HTML/CSS → Firebase Auth → AWS 배포)**
    → “애플리케이션을 만들고 서비스까지 올리는 과정” 연습.
*   **확장 목표 (WSL2 & Docker)**
    → “개발/운영 환경 자체를 자유자재로 다루는 능력”까지 확장.
*   **추가 확장 목표 (백엔드, DB, 스크립팅)**
    → “단순한 앱을 넘어, 데이터와 상호작용하고 높은 수준의 동적 기능을 갖춘 풀스택 서비스”로 발전.

즉, 기존 로드맵이 “**무엇을 만드는가**”에 집중했다면, 이번 확장은 “**어디서 어떻게 돌릴 것인가**”와 "**어떻게 더 발전시킬 것인가**"를 학습하는 셈입니다.

---

## ✅ 최종 체크리스트

*   [ ] WSL2에서 Rust/Node 빌드 성공
*   [ ] WSL2에서 AWS CLI + Firebase CLI 정상 동작
*   [ ] Docker 컨테이너로 React WASM 앱 실행
*   [ ] Firebase Emulator를 Docker에서 구동
*   [ ] docker-compose로 멀티 서비스 실행
*   [ ] GitHub Actions에서 Docker 빌드 성공
*   [ ] NestJS로 백엔드 API 서버 구축
*   [ ] SQLite 또는 PostgreSQL을 연동하여 데이터 저장
*   [ ] Rhai 스크립트를 WASM에 통합하여 동적 파라미터 수정 기능 구현

---

👉 이 로드맵을 따라가면, 단순히 웹앱을 개발·배포하는 수준을 넘어, **실제 실무 환경에서 쓰이는 개발/운영 기술 스택 전체를 작은 범위에서 경험**할 수 있을거라 기대됩니다.

---

