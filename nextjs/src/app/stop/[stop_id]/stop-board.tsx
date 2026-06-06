"use client";

import Arrivals from "@/app/components/arrivals";
import Clock from "@/app/components/clock";
import JourneyPlanner, { JourneyPlannerHandle } from "@/components/journey-planner";
import Roundel from "@/components/roundel";
import useRecentStops from "@/hooks/useRecentStops";
import { parseStopTitle } from "@/lib/utils";
import { ChevronLeft, MapPin } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

export default function StopBoard() {
  const params = useParams();
  const searchParams = useSearchParams();
  const stop_id = params.stop_id as string;
  const title = searchParams.get("title") ?? stop_id;

  const { addRecent } = useRecentStops();
  const mainRef = useRef<HTMLElement>(null);
  const plannerRef = useRef<JourneyPlannerHandle>(null);
  const plannerSentinelRef = useRef<HTMLDivElement>(null);
  const [plannerVisible, setPlannerVisible] = useState(false);

  useEffect(() => {
    if (stop_id) addRecent({ stop_id, title });
  }, [stop_id, title, addRecent]);

  useEffect(() => {
    const el = plannerSentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setPlannerVisible(entry.isIntersecting),
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scrollToPlanner = () => {
    const main = mainRef.current;
    const sentinel = plannerSentinelRef.current;
    if (main && sentinel) {
      main.scrollTo({ top: sentinel.offsetTop, behavior: "smooth" });
    }
    setTimeout(() => plannerRef.current?.focus(), 400);
  };

  const { name, stopLetter } = parseStopTitle(title);

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
        <div className="min-w-0">
          <h1 className="line-clamp-2 text-lg font-semibold leading-tight text-white">
            {name}
          </h1>
          {stopLetter ? (
            <span className="text-sm text-tfl-amber">{stopLetter}</span>
          ) : null}
        </div>
      </header>

      <main ref={mainRef} className="min-h-0 flex-1 overflow-y-auto">
        <Arrivals stop_id={stop_id} />
        <div ref={plannerSentinelRef}>
          <JourneyPlanner ref={plannerRef} stopId={stop_id} />
        </div>
      </main>

      <footer className="pt-4">
        <Clock />
      </footer>

      {!plannerVisible && (
        <button
          type="button"
          onClick={scrollToPlanner}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-tfl-amber px-5 py-2.5 text-sm font-semibold text-black shadow-lg"
        >
          <MapPin size={15} />
          Plan a journey
        </button>
      )}
    </div>
  );
}
