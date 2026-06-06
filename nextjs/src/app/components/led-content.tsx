"use client";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import { ChevronDown, Clock as ClockIcon, LocateFixed } from "lucide-react";
import Clock from "./clock";
import useLatLong from "@/hooks/useLatLong";
import useRecentStops from "@/hooks/useRecentStops";
import { getStopPoints } from "@/actions";
import { QUERY_KEYS } from "@/constants";
import { Skeleton } from "@/components/ui/skeleton";
import Roundel from "@/components/roundel";
import PostcodeSearch from "@/components/postcode-search";
import StopRow from "@/components/stop-row";

export default function LedContent({ postcode }: { postcode: string | null }) {
  const { latitude, longitude, error, locating, locate } = useLatLong(postcode);
  const { recents } = useRecentStops();

  const { data, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.STOPS, latitude, longitude],
    queryFn: () => getStopPoints({ lat: latitude, long: longitude }),
  });

  const stops = data?.stops ?? [];
  const [recentsOpen, setRecentsOpen] = useState(false);


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

      <button
        type="button"
        onClick={locate}
        disabled={locating}
        className="mt-2 flex items-center gap-1.5 self-start rounded-lg px-1 py-1 text-sm text-tfl-amber disabled:opacity-60"
      >
        <LocateFixed size={15} className={locating ? "animate-pulse" : ""} />
        {locating ? "Locating…" : "Use my location"}
      </button>

      {error && stops.length === 0 ? (
        <p className="pt-2 text-sm text-tfl-muted">
          Couldn’t get your location. Enter a postcode or stop name above, or try
          again.
        </p>
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

      {recents.length > 0 ? (
        <section className="pt-5">
          <button
            type="button"
            onClick={() => setRecentsOpen((o) => !o)}
            className="flex w-full items-center gap-1.5 pb-2 text-xs font-medium uppercase tracking-wide text-tfl-muted"
          >
            <ClockIcon size={13} />
            Recent stops
            <ChevronDown
              size={13}
              className={`ml-auto transition-transform duration-200 ${recentsOpen ? "rotate-180" : ""}`}
            />
          </button>
          {recentsOpen && (
            <div className="flex flex-col gap-2">
              {recents.map((r) => (
                <StopRow key={r.stop_id} stop_id={r.stop_id} title={r.title} />
              ))}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
