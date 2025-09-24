# 실수 및 해결 기록 (2025-09-24)

---

## 1. 주요 실수 및 해결 과정

### 1.1. `useTheme` 훅 생성 시 컴포넌트 반환 타입 오류

-   **실수:** React 컴포넌트 함수가 JSX를 반환해야 하는데, `HeaderProps`와 같은 props 타입을 반환하도록 잘못 선언함.
-   **해결:** 컴포넌트 함수의 반환 타입 선언을 제거하여 TypeScript가 JSX 반환을 올바르게 추론하도록 함.
-   **교훈:** React 컴포넌트 함수는 JSX 요소를 반환해야 하며, TypeScript 사용 시 명시적인 반환 타입 지정은 대부분 불필요하거나 `React.ReactNode` 등으로 해야 함.

### 1.2. `import React from "react";`의 필요성 오해

-   **실수:** JSX를 사용하는 파일에 `import React from "react";`가 항상 필수라고 생각함.
-   **해결:** React 17+의 새로운 JSX 변환 방식에서는 JSX만 사용하는 컴포넌트의 경우 해당 import가 필수가 아님을 학습하고 제거함.
-   **교훈:** 최신 React 버전에서는 JSX 변환 방식이 변경되어 `React` 객체를 직접 사용하지 않는 한 `import React from "react";`는 필수가 아님.

### 1.3. 컴포넌트 구조 설계 오류 (Header/Navigation 중첩)

-   **실수:** `Header` 컴포넌트를 `Navigation` 컴포넌트 안에 중첩하여 렌더링하여 시맨틱 및 레이아웃 문제를 발생시킴.
-   **해결:** `Header` 컴포넌트를 `Navigation` 컴포넌트에서 분리하여 `App.tsx`에서 독립적으로 렌더링하도록 수정함.
-   **교훈:** 각 컴포넌트의 역할과 시맨틱 구조를 명확히 이해하고, 불필요한 중첩을 피하여 올바른 컴포넌트 계층 구조를 설계해야 함.

### 1.4. `git rebase -i` 사용 미숙 및 `git push -f` 오용

-   **실수:** `git rebase -i` 과정에서 `pick`, `squash` 등의 명령어 사용에 혼란을 겪고, 문제를 해결하기 위해 `git push -f`를 사용함. 이로 인해 작업 손실 위험을 겪음.
-   **해결:** `git rebase --abort`로 안전하게 리베이스를 취소하고, `git rebase -i`의 사용법(기준 커밋, 대화형 에디터 명령어) 및 `git push -f`의 위험성, `git push --force-with-lease`의 안전한 사용법, 그리고 이미 푸시된 커밋은 리베이스하지 않는 것이 좋다는 Git 베스트 프랙티스를 학습함.
-   **교훈:** `git rebase`는 강력하지만 히스토리를 재작성하므로 신중하게 사용해야 하며, 특히 푸시된 커밋에는 사용하지 않아야 함. `git push -f`는 매우 위험하며, 불가피할 경우 `git push --force-with-lease`를 사용하고 협업자에게 알려야 함.
