// src/components/Navigation.tsx

export default function Navigation() {
    return (
    <nav className="pure-css-nav">
        <input type="checkbox" id="nav-toggle" className="nav-toggle-checkbox" />
        <label htmlFor="nav-toggle" className="nav-toggle-label">
            <span>≡</span>
        </label>

        <ul className="nav-menu">
            <li><a href="#">Home</a></li>
            <li><a href="#">About</a></li>
          <li><a href="#">Settings</a></li>
        </ul>
      </nav>
    )
}