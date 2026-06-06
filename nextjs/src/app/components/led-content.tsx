"use client";
import { useQuery } from "@tanstack/react-query";
import React from "react";
import Link from "next/link";
import { ChevronRight, Clock as ClockIcon } from "lucide-react";
import Clock from "./clock";
import useLatLong from "@/hooks/useLatLong";
import useRecentStops from "@/hooks/useRecentStops";
import { getStopPoints } from "@/actions";
import { QUERY_KEYS } from "@/constants";
import { parseStopTitle } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import Roundel from "@/components/roundel";
import PostcodeSearch from "@/components/postcode-search";

function stopHref(stop_id: string, title: string) {
  return `/stop/${encodeURIComponent(stop_id)}?title=${encodeURIComponent(
    title
  )}`;
}

export default function LedContent({ postcode }: { postcode: string | null }) {
  const { latitude, longitude } = useLatLong(postcode);
  const { recents } = useRecentStops();

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.STOPS, latitude, longitude],
    queryFn: () => getStopPoints({ lat: latitude, long: longitude }),
  });

  const stops = data?.stops ?? [];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex items-center gap-2 pb-4">
        <Roundel size={28} className="shrink-0" />
        <h1 className="flex-1 text-lg font-semibold text-white">
          Bus arrivals
        </h1>
        <Clock />
      </header>

      <PostcodeSearch initial={postcode ?? ""} />

      {recents.length > 0 ? (
        <section className="pt-5">
          <h2 className="flex items-center gap-1.5 pb-2 text-xs font-medium uppercase tracking-wide text-tfl-muted">
            <ClockIcon size={13} /> Recent stops
          </h2>
          <div className="flex flex-col gap-2">
            {recents.map((r) => {
              const { name, stopLetter } = parseStopTitle(r.title);
              return (
                <Link
                  key={r.stop_id}
                  href={stopHref(r.stop_id, r.title)}
                  className="flex items-center gap-2 rounded-xl border border-tfl-border bg-tfl-card px-3 py-2.5 active:bg-tfl-card-hover"
                >
                  <span className="flex-1 truncate text-base text-white">
                    {name}
                  </span>
                  {stopLetter ? (
                    <span className="shrink-0 text-sm text-tfl-amber">
                      {stopLetter}
                    </span>
                  ) : null}
                  <ChevronRight size={18} className="shrink-0 text-tfl-muted" />
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="flex min-h-0 flex-1 flex-col pt-5">
        <h2 className="pb-2 text-xs font-medium uppercase tracking-wide text-tfl-muted">
          Nearby stops
        </h2>
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-12 w-full rounded-xl bg-white/10"
                />
              ))}
            </div>
          ) : stops.length === 0 ? (
            <div className="rounded-xl border border-tfl-border bg-tfl-card p-6 text-center text-tfl-muted">
              No nearby stops found. Try another postcode.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {stops.map((stop) => {
                const { name, stopLetter } = parseStopTitle(stop.title);
                return (
                  <Link
                    key={stop.stop_id}
                    href={stopHref(stop.stop_id, stop.title)}
                    className="flex items-center gap-2 rounded-xl border border-tfl-border bg-tfl-card px-3 py-3 active:bg-tfl-card-hover"
                  >
                    <span className="flex-1 truncate text-base text-white">
                      {name}
                    </span>
                    {stopLetter ? (
                      <span className="shrink-0 text-sm text-tfl-amber">
                        {stopLetter}
                      </span>
                    ) : null}
                    <ChevronRight
                      size={18}
                      className="shrink-0 text-tfl-muted"
                    />
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
