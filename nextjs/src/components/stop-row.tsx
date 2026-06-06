import { ChevronRight } from "lucide-react";
import Link from "next/link";
import React from "react";
import { parseStopTitle } from "@/lib/utils";

type Props = {
  stop_id: string;
  title: string;
};

/** A tappable stop row linking to that stop's arrivals board. */
export default function StopRow({ stop_id, title }: Props) {
  const { name, stopLetter } = parseStopTitle(title);
  const href = `/stop/${encodeURIComponent(stop_id)}?title=${encodeURIComponent(
    title
  )}`;
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-xl border border-tfl-border bg-tfl-card px-3 py-3 active:bg-tfl-card-hover"
    >
      <span className="line-clamp-2 flex-1 text-base leading-snug text-white">
        {name}
      </span>
      {stopLetter ? (
        <span className="shrink-0 text-sm text-tfl-amber">{stopLetter}</span>
      ) : null}
      <ChevronRight size={18} className="shrink-0 text-tfl-muted" />
    </Link>
  );
}
