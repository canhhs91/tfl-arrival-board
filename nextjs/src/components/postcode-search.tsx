"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import React, { useState } from "react";

type Props = {
  initial?: string;
};

/**
 * Postcode entry that routes to the existing `/[postcode]` view, which resolves
 * coordinates via useLatLong. Normalizes input (uppercase, no spaces).
 */
export default function PostcodeSearch({ initial = "" }: Props) {
  const router = useRouter();
  const [value, setValue] = useState(initial);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const postcode = value.replace(/\s+/g, "").toUpperCase();
    if (!postcode) return;
    router.push(`/${encodeURIComponent(postcode)}`);
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
        autoComplete="postal-code"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Enter a postcode"
        aria-label="Postcode"
        className="w-full rounded-xl border border-tfl-border bg-tfl-card py-3 pl-10 pr-3 text-base text-white placeholder:text-tfl-muted outline-none focus:border-tfl-amber"
      />
    </form>
  );
}
