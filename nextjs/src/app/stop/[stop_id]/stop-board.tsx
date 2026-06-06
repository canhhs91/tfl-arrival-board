"use client";

import Arrivals from "@/app/components/arrivals";
import Clock from "@/app/components/clock";
import Roundel from "@/components/roundel";
import useRecentStops from "@/hooks/useRecentStops";
import { parseStopTitle } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect } from "react";

export default function StopBoard() {
  const params = useParams();
  const searchParams = useSearchParams();
  const stop_id = params.stop_id as string;
  const title = searchParams.get("title") ?? stop_id;

  const { addRecent } = useRecentStops();

  useEffect(() => {
    if (stop_id) addRecent({ stop_id, title });
  }, [stop_id, title, addRecent]);

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

      <main className="flex-1 overflow-y-auto">
        <Arrivals stop_id={stop_id} />
      </main>

      <footer className="pt-4">
        <Clock />
      </footer>
    </div>
  );
}
