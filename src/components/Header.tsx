// src/components/Header.tsx

interface HeaderProps {
    theme: string;
    toggleTheme: () => void;
}

export default function Header({ theme, toggleTheme }: HeaderProps) {
    return (
        <header className="app-header">
            <h1>WASM study & example</h1>
            <button onClick={toggleTheme} className="btn">
                {theme}
            </button>
        </header>
    )
}