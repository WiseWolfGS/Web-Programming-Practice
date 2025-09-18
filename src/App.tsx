import { useEffect, useState } from "react";
import { loadWasm } from "./wasm";

export default function App() {
  const [msg, setMsg] = useState("Loading...");
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    loadWasm().then((w) => {
      const sum = w.add(21, 21);
      const greet = w.hello("React");
      setMsg(`${greet} | sum=${sum}`);
    });

    // Set initial theme based on user preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(prefersDark ? "dark" : "light");
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <div className="container">
      <header className="app-header">
        <h1>GA-Life Sim</h1>
        <button onClick={toggleTheme} className="theme-toggle-button">
          Toggle Theme
        </button>
      </header>

      <main className="app-main">
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
              This section demonstrates the use of the HTML5 <code>&lt;details&gt;</code> element.
              It's a simple way to create a native accordion-style widget.
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
