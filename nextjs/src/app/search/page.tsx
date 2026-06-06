import { Suspense } from "react";
import SearchResults from "./search-results";

export default function SearchPage() {
  return (
    <div className="app-shell">
      <Suspense fallback={<div className="text-tfl-muted">Loading…</div>}>
        <SearchResults />
      </Suspense>
    </div>
  );
}
