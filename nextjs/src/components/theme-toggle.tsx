"use client";
import React from "react";
import { useTheme } from "@/contexts/theme-context";

const THEMES = [
  { value: "led",    label: "🟡 Led" },
  { value: "modern", label: "🔵 Blue" },
  { value: "pink",   label: "🩷 Pink" },
] as const;

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <select
      aria-label="Select theme"
      value={theme}
      onChange={(e) => setTheme(e.target.value as typeof theme)}
      className="rounded-md border border-tfl-border bg-tfl-card px-3 py-1.5 text-sm text-tfl-text transition-colors focus:outline-none"
    >
      {THEMES.map((t) => (
        <option key={t.value} value={t.value}>
          {t.label}
        </option>
      ))}
    </select>
  );
}
