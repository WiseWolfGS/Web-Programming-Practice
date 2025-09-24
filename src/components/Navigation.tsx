// src/components/Navigation.tsx
import Header from "./Header";

interface NavigationProps {
    theme: string;
    toggleTheme: () => void;
}

export default function Navigation({ theme, toggleTheme }: NavigationProps) {
    return (
    <nav className="pure-css-nav">
        <input type="checkbox" id="nav-toggle" className="nav-toggle-checkbox" />
        <label htmlFor="nav-toggle" className="nav-toggle-label">
            <span>≡</span>
        </label>

        <Header theme={theme} toggleTheme={toggleTheme} />

        <ul className="nav-menu">
            <li><a href="#">Home</a></li>
            <li><a href="#">About</a></li>
          <li><a href="#">Settings</a></li>
        </ul>
      </nav>
    )
}