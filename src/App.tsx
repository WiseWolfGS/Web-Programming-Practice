import { useEffect, useState } from "react";
import { loadWasm } from "./wasm";
import { auth } from "./lib/firebase";
import {
  // signInWithPopup을 삭제하고, 리디렉션 방식에 필요한 함수들을 import 합니다.
  GoogleAuthProvider,
  signInWithRedirect, // 페이지를 리디렉션하여 로그인
  getRedirectResult,  // 리디렉션 후 결과 가져오기
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";

export default function App() {
  const [msg, setMsg] = useState("Loading...");
  const [theme, setTheme] = useState("light");
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 로딩 상태를 추가하여, 리디렉션 결과를 처리하는 동안 UI가 깜빡이는 것을 방지합니다.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // --- 리디렉션 결과 처리 ---
    // 페이지가 로드될 때, Google 로그인으로부터 리디렉션되어 돌아온 것인지 확인합니다.
    getRedirectResult(auth)
      .then((result) => {
        // result가 null이 아니면, 방금 로그인을 성공적으로 마친 것입니다.
        // onAuthStateChanged가 어차피 호출되므로 여기서 별도의 user 상태 설정은 불필요합니다.
        if (result) {
          console.log("Redirect sign-in successful.");
        }
      })
      .catch((err) => {
        // 리디렉션 과정에서 발생한 에러를 처리합니다.
        let message = "An unknown error occurred during redirect.";
        if (
          typeof err === "object" &&
          err !== null &&
          "message" in err &&
          typeof (err as { message: unknown }).message === "string"
        ) {
          message = (err as { message: string }).message;
        }
        setError(message);
      });

    // --- 기존 로직들 ---
    loadWasm().then((w) => {
      const sum = w.add(21, 21);
      const greet = w.hello("React");
      setMsg(`${greet} | sum=${sum}`);
    });

    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setTheme(prefersDark ? "dark" : "light");

    // onAuthStateChanged는 사용자의 로그인 상태를 계속 감시합니다.
    // 페이지가 새로고침 되어도, Firebase가 세션을 복구하면 이 함수가 호출되어 user 상태를 설정합니다.
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false); // 사용자 상태가 확정되면 로딩 상태를 해제합니다.
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    const newTheme = theme
    localStorage.setItem('theme', newTheme)
  };

  // --- 인증 핸들러 ---
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
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

  // Google 로그인 핸들러가 매우 간단해집니다.
  const handleGoogleSignIn = async () => {
    setError("");
    await signOut(auth).catch(() => {});
    const provider = new GoogleAuthProvider();

    // 로그아웃 후 계정 선택 화면을 강제로 띄우기 위한 커스텀 OAuth 파라미터 추가
    provider.setCustomParameters({
      prompt: 'consent select_account' // 이 파라미터가 계정 선택 화면을 강제합니다.
    });

    await signInWithRedirect(auth, provider);
  };

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
  // 로딩 중일 때는 아무것도 표시하지 않거나 로딩 스피너를 보여줍니다.
  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      <header className="app-header">
        <h1>GA-Life Sim</h1>
        <button onClick={toggleTheme} className="theme-toggle-button">
          Toggle Theme
        </button>
      </header>

      <main className="app-main">
        {user ? (
          <section className="auth-section card">
            <h2>Welcome!</h2>
            <p>Signed in as: {user.email}</p>
            <button onClick={handleSignOut} className="auth-button">
              Sign Out
            </button>
          </section>
        ) : (
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

            <div className="separator">OR</div>
            <button
              onClick={handleGoogleSignIn}
              className="auth-button google-auth-button"
            >
              Sign in with Google
            </button>
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