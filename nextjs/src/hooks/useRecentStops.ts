"use client";

import { RecentStop } from "@/types";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "tfl-recent-stops";
const MAX_RECENTS = 8;

function read(): RecentStop[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RecentStop[]) : [];
  } catch {
    return [];
  }
}

/**
 * Persists recently viewed stops to localStorage, most-recent first, deduped by
 * stop_id and capped at MAX_RECENTS. SSR-safe: starts empty and hydrates on mount.
 */
export default function useRecentStops() {
  const [recents, setRecents] = useState<RecentStop[]>([]);

  useEffect(() => {
    setRecents(read());
  }, []);

  const addRecent = useCallback((stop: { stop_id: string; title: string }) => {
    if (!stop.stop_id) return;
    setRecents((prev) => {
      const next: RecentStop[] = [
        { stop_id: stop.stop_id, title: stop.title, viewedAt: Date.now() },
        ...prev.filter((r) => r.stop_id !== stop.stop_id),
      ].slice(0, MAX_RECENTS);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // ignore quota / availability errors
      }
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setRecents([]);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { recents, addRecent, clear };
}
