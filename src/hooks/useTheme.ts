// src/hooks/useTheme.ts
import { useState, useEffect } from "react";

export function useTheme() {
    const [theme, setTheme] = useState("light");

    // 3. 초기 테마 설정
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
        setTheme(savedTheme);
        } else {
        const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
        ).matches;
        setTheme(prefersDark ? "dark" : "light");
        }
    }, []);

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    return [theme, toggleTheme] as const;
}