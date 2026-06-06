"use client";

import { searchStops } from "@/actions";
import PostcodeSearch from "@/components/postcode-search";
import Roundel from "@/components/roundel";
import StopRow from "@/components/stop-row";
import { Skeleton } from "@/components/ui/skeleton";
import { QUERY_KEYS } from "@/constants";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, MapPin } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React from "react";

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim();

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.SEARCH, query],
    queryFn: () => searchStops(query),
    enabled: query.length > 0,
  });

  const stops = data?.stops ?? [];
  const location = data?.location;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-2 pb-4">
        <Link
          href="/"
          aria-label="Back"
          className="-ml-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white hover:bg-tfl-card"
        >
          <ChevronLeft size={22} />
        </Link>
        <Roundel size={26} className="shrink-0" />
        <h1 className="flex-1 truncate text-lg font-semibold text-white">
          Search
        </h1>
      </header>

      <PostcodeSearch initial={query} />

      <section className="flex min-h-0 flex-1 flex-col pt-5">
        <h2 className="truncate pb-2 text-xs font-medium uppercase tracking-wide text-tfl-muted">
          {query ? `Results for "${query}"` : "Enter a stop name"}
        </h2>

        {location && !isLoading && (
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-tfl-border bg-tfl-card px-3 py-2.5">
            <MapPin size={14} className="shrink-0 text-tfl-amber" />
            <span className="text-sm text-white">{location}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {query && isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-12 w-full rounded-xl bg-white/10"
                />
              ))}
            </div>
          ) : query && stops.length === 0 ? (
            <div className="rounded-xl border border-tfl-border bg-tfl-card p-6 text-center text-tfl-muted">
              No bus stops found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {stops.map((stop) => (
                <StopRow
                  key={stop.stop_id}
                  stop_id={stop.stop_id}
                  title={stop.title}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
