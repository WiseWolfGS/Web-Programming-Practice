## 2025년 9월 20일 토요일 - 세션 #4

### 완료된 작업
*   로드맵 2-2. 'HTML5 + CSS3 최신 기능 연습' 최종 마무리
*   CSS 변수와 `localStorage`를 이용한 테마 설정 유지 기능 구현 완료.
*   `App.tsx`의 `useEffect` 훅을 인증, WASM, 테마 초기화 등 관심사에 따라 분리하여 코드 가독성 향상 (리팩토링).
*   '체크박스 해킹' 기법을 이용한 순수 CSS 사이드 내비게이션 메뉴 구현 및 디버깅.
*   재사용 가능한 `.btn` 공통 클래스를 생성하여 모든 버튼에 일관된 테마 스타일 적용.
*   Firebase Hosting 배포 전 `yarn build` 과정의 중요성을 학습하고, 최신 변경사항을 성공적으로 배포.

### 다음 단계
*   로드맵의 다음 단계(AWS 배포 또는 확장 로드맵)로 진행할 준비 완료.

---

# 프로젝트 세션 로그

## 2025년 9월 18일 목요일 - 세션 #3

### 완료된 작업
*   로드맵 2-3. Firebase Auth (로그인만) 기능 구현 완료
    *   이메일/비밀번호 로그인 및 로그아웃 기능 구현
    *   Google 소셜 로그인 (리디렉션 방식) 기능 구현
    *   `prompt: 'select_account'` 매개변수 추가
*   Firebase Google 소셜 로그인 관련 복합적인 디버깅 및 문제 해결
    *   `apiKey` 오타 수정
    *   `Cross-Origin-Opener-Policy` 및 `Cross-Origin-Embedder-Policy` 헤더 설정 문제 해결 시도
    *   Firebase Hosting 활성화 및 최초 배포를 통한 `init.json` 오류 해결
    *   `authDomain` 및 `redirectUrl` 불일치 문제 해결
    *   Google Cloud 콘솔의 '승인된 JavaScript 출처' 및 '승인된 리디렉션 URI' 설정 누락 문제 해결
    *   `localhost` HTTPS 환경 구축 (`vite-plugin-basic-ssl` 사용)
    *   `getRedirectResult`가 `null`을 반환하는 문제에 대한 심층 디버깅 (브라우저 세션/쿠키 정책, `persistence` 설정 등)
    *   `auth/argument-error` 해결
*   `docs/mistakes/firebase_auth_deep_dive_20250918.md` 문서 작성 (상세 디버깅 과정 기록)
*   배포 환경에서 Google 소셜 로그인 기능 정상 동작 확인

### 다음 단계
*   로드맵 2-3. Firebase Auth 기능 구현 완료. 다음 로드맵 단계로 이동 준비.

---

## 2025년 9월 18일 목요일 - 세션 #2

### 완료된 작업
*   로드맵 2-2. HTML5 + CSS3 최신 기능 연습 완료
    *   시맨틱 태그(`header`, `main`, `footer`)를 사용한 레이아웃 구조화
    *   CSS Grid 및 Flexbox를 이용한 반응형 디자인 구현
    *   CSS 변수를 활용한 Light/Dark 테마 토글 기능 추가
    *   Keyframe을 사용한 간단한 애니메이션 적용
    *   HTML5 `<details>` 요소를 사용한 정보 섹션 구현
*   Git에 변경 사항 커밋 (`feat: Implement responsive layout and theme toggle (Roadmap 2-2)`)

### 다음 단계
*   로드맵 2-3. Firebase Auth (로그인만) 기능 구현 시작.

---

## 2025년 9월 17일 수요일 - 세션 #1

### 완료된 작업
*   로드맵 0) 개발 환경 설정 완료 (Node, Yarn, Rust, wasm-pack 확인)
*   로드맵 1) 프로젝트 골격(디렉토리/스캐폴딩) 설정 완료 (Vite 프로젝트 생성, wasm-core 이동, Cargo.toml, lib.rs, package.json 스크립트 설정)
*   로드맵 2-1. Rust WASM ↔ React 기초 연동 완료 (add, hello 함수 호출 확인)
*   `.gitignore` 파일 검토 및 확인
*   GitHub에 초기 설정 커밋 및 푸시, LICENSE 파일 추가 및 풀

### 주요 문제 및 해결
*   `yarn create vite` 미실행으로 인한 프로젝트 구조 오류 발생 및 해결 (자세한 내용은 `mistakes_summary.txt` 참조)
*   `Cargo.toml` 의존성 이름 오타, `rust-analyzer` 오류, `wasm-pack build` 출력 경로 문제, `#[wasm_bindgen]` 매크로 누락, 중첩된 Git 저장소 문제 해결.

### 다음 단계
*   로드맵 2-2. HTML5 + CSS3 최신 기능 연습 시작.