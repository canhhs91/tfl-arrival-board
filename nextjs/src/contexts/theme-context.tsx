"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  PropsWithChildren,
} from "react";

type Theme = "led" | "modern";
const STORAGE_KEY = "tfl-theme";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "led",
  setTheme: () => {},
});

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<Theme>("led");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
      const resolved: Theme = stored === "led" ? "led" : "modern";
      setThemeState(resolved);
      document.documentElement.setAttribute(
        "data-theme",
        resolved === "modern" ? "modern" : ""
      );
    } catch {}
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {}
    document.documentElement.setAttribute(
      "data-theme",
      t === "modern" ? "modern" : ""
    );
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
