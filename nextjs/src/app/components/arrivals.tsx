"use client";

import { getArrival, getNextStops } from "@/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { QUERY_KEYS } from "@/constants";
import { useTheme } from "@/contexts/theme-context";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, ChevronUp, MapPin } from "lucide-react";
import React, { useState } from "react";

type Props = {
  stop_id?: string;
};

function NextStopsDropdown({
  lineName,
  stopId,
}: {
  lineName: string;
  stopId: string;
}) {
  const { data: stops, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.NEXT_STOPS, lineName, stopId],
    queryFn: () => getNextStops(lineName, stopId),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-1.5 px-3 pb-3 pt-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full rounded bg-white/10" />
        ))}
      </div>
    );
  }

  if (!stops || stops.length === 0) {
    return (
      <p className="px-3 pb-3 pt-1 text-sm text-tfl-muted">
        No upcoming stops found.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1 px-3 pb-3 pt-1">
      {stops.map((stop) => (
        <div
          key={stop.naptanId}
          className="flex items-center gap-2 text-sm text-tfl-muted"
        >
          <MapPin size={11} className="shrink-0 text-tfl-amber/60" />
          <span>{stop.name}</span>
        </div>
      ))}
    </div>
  );
}

export default function Arrivals({ stop_id }: Props) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const { theme } = useTheme();
  const isModern = theme === "modern";

  const {
    data: arrivals,
    isLoading,
    isError,
  } = useQuery({
    queryKey: [QUERY_KEYS.ARRIVALS, stop_id],
    queryFn: () => getArrival(stop_id!),
    enabled: !!stop_id,
    refetchInterval: 10000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-3 rounded-xl border border-tfl-border bg-tfl-card p-3"
          >
            <Skeleton className="h-10 w-12 rounded-lg bg-tfl-badge/30" />
            <Skeleton className="h-5 flex-1 rounded-full bg-white/10" />
            <Skeleton className="h-7 w-10 rounded-full bg-white/10" />
          </div>
        ))}
      </div>
    );
  }

  if (isError || !arrivals || arrivals.length === 0) {
    return (
      <div className="rounded-xl border border-tfl-border bg-tfl-card p-6 text-center text-tfl-muted">
        No arrivals expected right now.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {arrivals.slice(0, 10).map((arrival, index) => {
        const isDue = arrival.timeToStationMins === "due";
        const isExpanded = expandedIndex === index;
        const timeNum = arrival.timeToStationMins?.split(" ")[0] ?? "";

        return (
          <div
            key={`${arrival.lineName}-${index}`}
            className="overflow-hidden rounded-xl border border-tfl-border bg-tfl-card"
          >
            <button
              type="button"
              onClick={() => setExpandedIndex(isExpanded ? null : index)}
              className="flex w-full items-center gap-3 p-3"
            >
              {/* Line badge */}
              <span className="inline-flex min-w-12 shrink-0 items-center justify-center rounded-lg bg-tfl-badge px-2 py-1.5 text-base font-bold text-tfl-badge-text">
                {arrival.lineName}
              </span>

              {/* Destination */}
              <span className="flex-1 truncate text-left text-base font-semibold text-white">
                {arrival.destinationName}
              </span>

              {/* Time */}
              {isModern ? (
                isDue ? (
                  <span className="shrink-0 text-right text-sm font-bold text-tfl-amber">
                    Due
                  </span>
                ) : (
                  <div className="flex shrink-0 items-baseline gap-0.5 text-right tabular-nums">
                    <span className="text-2xl font-bold text-white">{timeNum}</span>
                    <span className="text-xs text-tfl-muted">min</span>
                  </div>
                )
              ) : (
                <span
                  className={`shrink-0 text-right text-base font-semibold tabular-nums ${
                    isDue ? "text-tfl-amber" : "text-white"
                  }`}
                >
                  {arrival.timeToStationMins}
                </span>
              )}

              {/* Expand chevron */}
              {isModern ? (
                <ChevronRight size={18} className="shrink-0 text-tfl-muted" />
              ) : isExpanded ? (
                <ChevronUp size={16} className="shrink-0 text-tfl-muted" />
              ) : (
                <ChevronDown size={16} className="shrink-0 text-tfl-muted" />
              )}
            </button>
            {isExpanded && stop_id && (
              <NextStopsDropdown
                lineName={arrival.lineName}
                stopId={stop_id}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
