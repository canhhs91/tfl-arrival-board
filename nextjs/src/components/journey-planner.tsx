"use client";

import { getStopPoints, planJourney, searchDestinations } from "@/actions";
import { QUERY_KEYS } from "@/constants";
import { DestinationSuggestion, Journey } from "@/types";
import { useQuery } from "@tanstack/react-query";
import {
  Bus,
  CableCar,
  ChevronRight,
  Clock,
  Footprints,
  History,
  MapPin,
  MapPinned,
  Navigation,
  Search,
  Train,
  X,
} from "lucide-react";
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

/* ─── recent searches (localStorage) ───────────────────────────────────────── */
const RECENT_KEY = "tfl-journey-recent";
const MAX_RECENT = 5;

function loadRecent(): DestinationSuggestion[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]"); } catch { return []; }
}

function saveRecent(item: DestinationSuggestion, current: DestinationSuggestion[]) {
  const next = [item, ...current.filter((r) => r.id !== item.id)].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  return next;
}

function deleteRecent(id: string, current: DestinationSuggestion[]) {
  const next = current.filter((r) => r.id !== id);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  return next;
}

/* ─── mode icon ─────────────────────────────────────────────────────────── */
function ModeIcon({ mode, className }: { mode: string; className?: string }) {
  const cls = `shrink-0 ${className ?? ""}`;
  if (mode === "bus") return <Bus size={14} className={cls} />;
  if (mode === "tube" || mode === "elizabeth-line" || mode === "dlr")
    return <Train size={14} className={cls} />;
  if (mode === "walking") return <Footprints size={14} className={cls} />;
  if (mode === "cable-car") return <CableCar size={14} className={cls} />;
  return <Navigation size={14} className={cls} />;
}

/* ─── format HH:MM from ISO string ──────────────────────────────────────── */
function fmtTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

/* ─── leg row ────────────────────────────────────────────────────────────── */
function LegRow({ leg, first }: { leg: Journey["legs"][number]; first: boolean }) {
  const isWalk = leg.mode === "walking";
  return (
    <div className={`flex items-start gap-2.5 ${first ? "" : "mt-1"}`}>
      <div
        className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
          isWalk
            ? "bg-tfl-border text-tfl-muted"
            : "bg-tfl-amber text-black"
        }`}
      >
        <ModeIcon mode={leg.mode} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug text-white">
          {leg.instruction || `${leg.line} to ${leg.to}`}
        </p>
        <p className="text-xs text-tfl-muted">
          {fmtTime(leg.departureTime)} · {leg.duration} min
        </p>
      </div>
    </div>
  );
}

/* ─── journey result card ───────────────────────────────────────────────── */
function JourneyCard({
  journey,
  onClear,
}: {
  journey: Journey;
  onClear: () => void;
}) {
  return (
    <div className="mt-3 rounded-xl border border-tfl-border bg-tfl-card p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Clock size={13} className="text-tfl-amber" />
          <span className="text-sm font-semibold text-tfl-amber">
            {journey.totalDuration} min · departs {fmtTime(journey.departureTime)}
          </span>
        </div>
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear journey"
          className="text-tfl-muted hover:text-white"
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex flex-col gap-2.5">
        {journey.legs.map((leg, i) => (
          <LegRow key={i} leg={leg} first={i === 0} />
        ))}
      </div>
    </div>
  );
}

/* ─── main component ────────────────────────────────────────────────────── */
type Props = { stopId: string };
export type JourneyPlannerHandle = { focus: () => void };

const JourneyPlanner = forwardRef<JourneyPlannerHandle, Props>(function JourneyPlanner({ stopId }, ref) {
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<DestinationSuggestion | null>(null);
  const [open, setOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<DestinationSuggestion[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setRecentSearches(loadRecent()); }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => {}
    );
  }, []);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  // Debounce the search query by 350 ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!input.trim() || selected) {
      setQuery("");
      return;
    }
    debounceRef.current = setTimeout(() => setQuery(input.trim()), 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input, selected]);

  const { data: suggestions = [], isFetching: searchLoading } = useQuery({
    queryKey: [QUERY_KEYS.DESTINATIONS, query],
    queryFn: () => searchDestinations(query),
    enabled: query.length >= 2 && !selected,
  });

  const { data: journey, isLoading: journeyLoading } = useQuery({
    queryKey: [QUERY_KEYS.JOURNEY, stopId, selected?.id],
    queryFn: () => planJourney(stopId, selected!.id),
    enabled: !!selected,
  });

  const { data: nearbyStops = [] } = useQuery({
    queryKey: [QUERY_KEYS.NEARBY, coords?.lat, coords?.lon],
    queryFn: async () => {
      const { stops } = await getStopPoints({ lat: coords!.lat, long: coords!.lon });
      return stops.map((s): DestinationSuggestion => ({ id: s.stop_id, name: s.title, type: 'stop' }));
    },
    enabled: !!coords,
    staleTime: 60_000,
  });

  // Scroll the planner header into view as soon as a destination is chosen.
  useEffect(() => {
    if (selected) {
      containerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selected]);

  // Scroll the result card into view once the journey loads.
  useEffect(() => {
    if (!journeyLoading && journey !== undefined) {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [journeyLoading, journey]);

  const handleSelect = (s: DestinationSuggestion) => {
    setSelected(s);
    setInput(s.name);
    setOpen(false);
    setQuery("");
    setRecentSearches((prev) => saveRecent(s, prev));
  };

  const handleRemoveRecent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches((prev) => deleteRecent(id, prev));
  };

  const handleClear = () => {
    setSelected(null);
    setInput("");
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="pt-4">
      <p className="pb-2 text-xs font-medium uppercase tracking-wide text-tfl-muted">
        Plan a journey
      </p>

      {/* search input */}
      <div className="relative">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-tfl-muted"
        />
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setSelected(null);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Where to?"
          aria-label="Destination"
          className="w-full rounded-xl border border-tfl-border bg-tfl-card py-2.5 pl-9 pr-9 text-base text-white placeholder:text-tfl-muted outline-none focus:border-tfl-amber"
        />
        {input ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear destination"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-tfl-muted hover:text-white"
          >
            <X size={16} />
          </button>
        ) : null}

        {/* suggestions dropdown */}
        {open && !selected && (query.length >= 2 || searchLoading || (!input && (nearbyStops.length > 0 || recentSearches.length > 0))) ? (
          <div className="absolute left-0 right-0 top-full z-10 mt-1 overflow-hidden rounded-xl border border-tfl-border bg-tfl-card shadow-lg">
            {!input && (nearbyStops.length > 0 || recentSearches.length > 0) ? (
              <>
                {nearbyStops.length > 0 && (
                  <>
                    <p className="px-3 pt-2.5 pb-1 text-xs font-medium uppercase tracking-wide text-tfl-muted">
                      Nearby
                    </p>
                    {nearbyStops.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelect(s)}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-white hover:bg-tfl-card-hover active:bg-tfl-card-hover"
                      >
                        <MapPinned size={14} className="shrink-0 text-tfl-muted" />
                        {s.name}
                      </button>
                    ))}
                  </>
                )}
                {recentSearches.length > 0 && (
                  <>
                    <p className={`px-3 pb-1 text-xs font-medium uppercase tracking-wide text-tfl-muted ${nearbyStops.length > 0 ? "pt-2 border-t border-tfl-border mt-1" : "pt-2.5"}`}>
                      Recent
                    </p>
                    {recentSearches.map((s) => (
                      <div
                        key={s.id}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-sm text-white hover:bg-tfl-card-hover active:bg-tfl-card-hover"
                      >
                        <button
                          type="button"
                          onClick={() => handleSelect(s)}
                          className="flex flex-1 items-center gap-2 text-left"
                        >
                          <History size={14} className="shrink-0 text-tfl-muted" />
                          {s.name}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveRecent(s.id, e)}
                          aria-label="Remove from recent"
                          className="text-tfl-muted hover:text-white"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </>
                )}
              </>
            ) : searchLoading && suggestions.length === 0 ? (
              <p className="px-3 py-3 text-sm text-tfl-muted">Searching…</p>
            ) : suggestions.length === 0 ? (
              <p className="px-3 py-3 text-sm text-tfl-muted">No results found.</p>
            ) : (
              suggestions.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSelect(s)}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-white hover:bg-tfl-card-hover active:bg-tfl-card-hover"
                >
                  {s.type === 'address'
                    ? <MapPin size={14} className="shrink-0 text-tfl-muted" />
                    : <ChevronRight size={14} className="shrink-0 text-tfl-muted" />}
                  {s.name}
                </button>
              ))
            )}
          </div>
        ) : null}
      </div>

      {/* journey result */}
      <div ref={resultRef}>
        {selected && journeyLoading ? (
          <div className="mt-3 rounded-xl border border-tfl-border bg-tfl-card p-4 text-sm text-tfl-muted">
            Planning route…
          </div>
        ) : selected && journey ? (
          <JourneyCard journey={journey} onClear={handleClear} />
        ) : selected && journey === null ? (
          <div className="mt-3 rounded-xl border border-tfl-border bg-tfl-card p-4 text-sm text-tfl-muted">
            No route found. Try a different destination.
          </div>
        ) : null}
      </div>
    </div>
  );
});

export default JourneyPlanner;
