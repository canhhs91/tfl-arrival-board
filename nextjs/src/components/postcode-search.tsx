"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import React, { useState } from "react";

type Props = {
  initial?: string;
};

// Loose UK postcode shape, tested against the space-stripped value.
const POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/;

/**
 * Single entry box that detects a UK postcode vs a free-text stop name.
 * Postcodes route to `/[postcode]` (nearby stops); anything else routes to the
 * `/search` results page (search by stop name).
 */
export default function PostcodeSearch({ initial = "" }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(initial);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const raw = value.trim();
    if (!raw) return;
    const compact = raw.replace(/\s+/g, "").toUpperCase();
    if (POSTCODE_RE.test(compact)) {
      router.push(`/${encodeURIComponent(compact)}`);
    } else {
      router.push(`/search?q=${encodeURIComponent(raw)}`);
    }
  };

  return (
    <form onSubmit={onSubmit} className="relative w-full">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tfl-muted"
        size={18}
      />
      <input
        type="text"
        inputMode="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Postcode or stop name"
        aria-label="Postcode or stop name"
        className="w-full rounded-xl border border-tfl-border bg-tfl-card py-3 pl-10 pr-3 text-base text-white placeholder:text-tfl-muted outline-none focus:border-tfl-amber"
      />
    </form>
  );
}
