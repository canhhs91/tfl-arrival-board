"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  PropsWithChildren,
} from "react";

type Theme = "led" | "modern" | "pink";
const STORAGE_KEY = "tfl-theme";
const VALID_THEMES: Theme[] = ["led", "modern", "pink"];

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "led",
  setTheme: () => {},
});

function applyTheme(t: Theme) {
  document.documentElement.setAttribute("data-theme", t === "led" ? "" : t);
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<Theme>("led");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      const resolved: Theme = stored && VALID_THEMES.includes(stored) ? stored : "led";
      setThemeState(resolved);
      applyTheme(resolved);
    } catch {}
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {}
    applyTheme(t);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
