import { useEffect, useState } from "react";
import { loadWasm } from "./wasm";
import { auth } from "./lib/firebase";
import { useTheme } from "./hooks/useTheme";
import './App.css'
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

import Navigation from "./components/Navigation";
import Footer from "./components/Footer";

export default function App() {
  const [theme, toggleTheme] = useTheme();
  const [msg, setMsg] = useState("Loading...");
  const [user, setUser] = useState<User | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 로딩 상태를 추가하여, 리디렉션 결과를 처리하는 동안 UI가 깜빡이는 것을 방지합니다.
  const [isLoading, setIsLoading] = useState(true);

  // 1. 인증 상태 관리 (Firebase)
  useEffect(() => {
    // Google 로그인 리디렉션 결과 처리
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.log("Redirect sign-in successful.");
        }
      })
      .catch((err) => {
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

    // 사용자의 로그인 상태를 감시하고, 변경 시 user 상태를 업데이트
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false); // 사용자 상태가 확정되면 로딩을 해제
    });

    // 컴포넌트가 언마운트될 때 감시를 중단
    return () => unsubscribe();
  }, []);

  // 2. WASM 모듈 로딩
  useEffect(() => {
    loadWasm().then((w) => {
      const sum = w.add(21, 21);
      const greet = w.hello("React");
      setMsg(`${greet} | sum=${sum}`);
    });
  }, []);



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

      <Navigation theme={theme} toggleTheme={toggleTheme} />

      <main className="app-main">
        {user ? (
          <section className="auth-section card">
            <h2>Welcome!</h2>
            <p>Signed in as: {user.email}</p>
            <button onClick={handleSignOut} className="btn">
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
              <button type="submit" className="btn">
                Sign In
              </button>
              {error && <p className="error-message">{error}</p>}
            </form>

            <div className="separator">OR</div>
            <button
              onClick={handleGoogleSignIn}
              className="btn google-auth-button"
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

      <Footer developerEmail="wwgs2005@gmail.com" developerInstaNickname="riftn7702"/>
    </div>
  );
}