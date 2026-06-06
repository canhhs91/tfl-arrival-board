import { getArrival } from "@/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { QUERY_KEYS } from "@/constants";
import { useQuery } from "@tanstack/react-query";
import React from "react";

type Props = {
  stop_id?: string;
};

export default function Arrivals({ stop_id }: Props) {
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
            <Skeleton className="h-7 w-12 rounded-md bg-tfl-amber/30" />
            <Skeleton className="h-5 flex-1 rounded-full bg-white/10" />
            <Skeleton className="h-5 w-12 rounded-full bg-tfl-amber/30" />
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
        return (
          <div
            key={`${arrival.lineName}-${index}`}
            className="flex items-center gap-3 rounded-xl border border-tfl-border bg-tfl-card p-3"
          >
            <span className="inline-flex min-w-12 shrink-0 items-center justify-center rounded-md bg-tfl-amber px-2 py-1 text-base font-bold text-black">
              {arrival.lineName}
            </span>
            <span className="flex-1 truncate text-base text-white">
              {arrival.destinationName}
            </span>
            <span
              className={`shrink-0 text-right text-base font-semibold tabular-nums ${
                isDue ? "text-tfl-amber" : "text-white"
              }`}
            >
              {arrival.timeToStationMins}
            </span>
          </div>
        );
      })}
    </div>
  );
}
