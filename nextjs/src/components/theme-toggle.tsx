"use client";
import React from "react";
import { useTheme } from "@/contexts/theme-context";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div role="group" aria-label="Theme" className="flex items-center gap-1.5">
      {/* TfL: blue circle with white dot */}
      <button
        type="button"
        onClick={() => setTheme("modern")}
        aria-pressed={theme === "modern"}
        aria-label="Modern TfL theme"
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 bg-tfl-blue transition-all ${
          theme === "modern"
            ? "border-white"
            : "border-white/20 opacity-50"
        }`}
      >
        <span className="h-2.5 w-2.5 rounded-full bg-white" />
      </button>

      {/* LED: black circle with yellow dot */}
      <button
        type="button"
        onClick={() => setTheme("led")}
        aria-pressed={theme === "led"}
        aria-label="LED theme"
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 bg-black transition-all ${
          theme === "led"
            ? "border-tfl-amber"
            : "border-white/20 opacity-50"
        }`}
      >
        <span className="h-2.5 w-2.5 rounded-full bg-tfl-amber" />
      </button>
    </div>
  );
}
