import { useEffect, useState } from "react";
import { loadWasm } from "./wasm";
// Firebase Auth 관련 함수와 객체를 가져옵니다.
import { auth } from "./lib/firebase";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User, // 최신 TypeScript의 verbatimModuleSyntax라는 설정 때문에 그냥 User로 쓰는 것이 불가능. User는 실제 코드로 존재하는 '값'이 아니라, TypeScript 코드의 타입 체크에만 사용되는 '타입'으로, verbatimModuleSyntax 설정은 이처럼 타입만 있는 경우, import type을 사용하여 명시적으로 알려주기를 요구한다.
} from "firebase/auth";

export default function App() {
  // --- 기존 WASM 상태 ---
  const [msg, setMsg] = useState("Loading...");

  // --- 테마 상태 ---
  const [theme, setTheme] = useState("light");

  // --- Firebase Auth 상태 ---
  // 로그인된 사용자 정보를 저장할 상태 (User 객체 또는 null)
  const [user, setUser] = useState<User | null>(null);
  // 이메일, 비밀번호 입력을 위한 상태
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // 에러 메시지를 표시할 상태
  const [error, setError] = useState("");

  // 컴포넌트가 처음 렌더링될 때 실행되는 useEffect
  useEffect(() => {
    // 1. WASM 모듈 로드
    loadWasm().then((w) => {
      const sum = w.add(21, 21);
      const greet = w.hello("React");
      setMsg(`${greet} | sum=${sum}`);
    });

    // 2. 사용자의 선호에 따라 초기 테마 설정
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setTheme(prefersDark ? "dark" : "light");

    // 3. Firebase의 인증 상태 변경을 감지하는 리스너 설정
    // 이 함수는 로그인, 로그아웃, 또는 페이지 새로고침 시 토큰이 복원될 때 호출됩니다.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // 감지된 사용자 정보로 상태 업데이트
    });

    // 컴포넌트가 언마운트될 때 리스너를 정리합니다 (메모리 누수 방지).
    return () => unsubscribe();
  }, []);

  // 테마 상태가 변경될 때마다 HTML 최상위 요소의 속성을 변경
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // --- 테마 핸들러 ---
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  // --- 인증 핸들러 ---
  // 로그인 버튼 클릭 시 실행
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault(); // 폼 제출 기본 동작 방지
    setError(""); // 이전 에러 메시지 초기화
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      let message = "An unknown error occurred.";
      if (
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof (err as { message: unknown }).message === "string"
      ) {
        message = (err as { message: string }).message;
      }
      setError(message);
    }
  };

  // 로그아웃 버튼 클릭 시 실행
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      let message = "An unknown error occurred.";
      if (
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof (err as { message: unknown }).message === "string"
      ) {
        message = (err as { message: string }).message;
      }
      setError(message);
    }
  };

  // --- 렌더링 로직 ---
  return (
    <div className="container">
      <header className="app-header">
        <h1>GA-Life Sim</h1>
        <button onClick={toggleTheme} className="theme-toggle-button">
          Toggle Theme
        </button>
      </header>

      <main className="app-main">
        {/* 사용자 로그인 상태에 따라 다른 UI를 보여줍니다. */}
        {user ? (
          // --- 로그인 되었을 때의 UI ---
          <section className="auth-section card">
            <h2>Welcome!</h2>
            <p>Signed in as: {user.email}</p>
            <button onClick={handleSignOut} className="auth-button">
              Sign Out
            </button>
          </section>
        ) : (
          // --- 로그아웃 되었을 때의 UI ---
          <section className="auth-section card">
            <h2>Login</h2>
            <form onSubmit={handleSignIn}>
              <div className="form-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="test@example.com"
                  required
                />
              </div>
              <div className="form-field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password"
                  required
                />
              </div>
              <button type="submit" className="auth-button">
                Sign In
              </button>
              {error && <p className="error-message">{error}</p>}
            </form>
          </section>
        )}

        <section className="wasm-output-section card">
          <h2>WASM Output</h2>
          <p className="wasm-message">{msg}</p>
          <div className="animated-box"></div>
        </section>

        <section className="info-section card">
          <h2>About This Section</h2>
          <details>
            <summary>What is this for?</summary>
            <p>
              This section demonstrates the use of the HTML5{" "}
              <code>&lt;details&gt;</code> element. It's a simple way to create a
              native accordion-style widget.
            </p>
          </details>
        </section>
      </main>

      <footer className="app-footer">
        <p>&copy; 2025 GA-Life Project. All rights reserved.</p>
      </footer>
    </div>
  );
}