"use client";
import React from "react";
import { useTheme } from "@/contexts/theme-context";

const THEMES = [
  { value: "led",    label: "🟡" },
  { value: "modern", label: "🔵" },
  { value: "pink",   label: "🩷" },
] as const;

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <select
      aria-label="Select theme"
      value={theme}
      onChange={(e) => setTheme(e.target.value as typeof theme)}
      className="appearance-none rounded-full bg-tfl-card px-1.5 py-0.5 text-sm text-tfl-text transition-colors focus:outline-none"
    >
      {THEMES.map((t) => (
        <option key={t.value} value={t.value}>
          {t.label}
        </option>
      ))}
    </select>
  );
}
