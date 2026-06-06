"use client";

import { searchPlaces } from "@/actions";
import { QUERY_KEYS } from "@/constants";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

const POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/;

type Props = {
  onSelect: (lat: number, lon: number, name: string) => void;
  onClear: () => void;
};

export default function LocationSearch({ onSelect, onClear }: Props) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const compact = input.trim().replace(/\s+/g, "").toUpperCase();
    if (!input.trim() || POSTCODE_RE.test(compact)) {
      setQuery("");
      return;
    }
    debounceRef.current = setTimeout(() => setQuery(input.trim()), 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input]);

  const { data: suggestions = [], isFetching } = useQuery({
    queryKey: [QUERY_KEYS.PLACES, query],
    queryFn: () => searchPlaces(query),
    enabled: query.length >= 2,
  });

  const handleSelect = (s: { id: string; name: string }) => {
    const [lat, lon] = s.id.split(",").map(Number);
    onSelect(lat, lon, s.name);
    setInput(s.name);
    setOpen(false);
    setQuery("");
  };

  const handleClear = () => {
    setInput("");
    setQuery("");
    setOpen(false);
    onClear();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const compact = input.trim().replace(/\s+/g, "").toUpperCase();
      if (POSTCODE_RE.test(compact)) {
        router.push(`/${encodeURIComponent(compact)}`);
      }
    }
    if (e.key === "Escape") setOpen(false);
  };

  const showDropdown = open && query.length >= 2;

  return (
    <div className="relative">
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tfl-muted"
      />
      <input
        type="text"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Where are you now?"
        aria-label="Location search"
        className="w-full rounded-xl border border-tfl-border bg-tfl-card py-3 pl-10 pr-9 text-base text-white placeholder:text-tfl-muted outline-none focus:border-tfl-amber"
      />
      {input && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-tfl-muted hover:text-white"
        >
          <X size={16} />
        </button>
      )}

      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-tfl-border bg-tfl-card shadow-lg">
          {isFetching && suggestions.length === 0 ? (
            <p className="px-3 py-3 text-sm text-tfl-muted">Searching…</p>
          ) : suggestions.length === 0 ? (
            <p className="px-3 py-3 text-sm text-tfl-muted">No locations found.</p>
          ) : (
            suggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelect(s)}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-white hover:bg-tfl-card-hover active:bg-tfl-card-hover"
              >
                <MapPin size={14} className="shrink-0 text-tfl-muted" />
                {s.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
