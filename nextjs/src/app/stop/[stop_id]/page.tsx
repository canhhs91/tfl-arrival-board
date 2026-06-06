import { Suspense } from "react";
import StopBoard from "./stop-board";

export default function StopPage() {
  return (
    <div className="app-shell">
      <Suspense fallback={<div className="text-tfl-muted">Loading…</div>}>
        <StopBoard />
      </Suspense>
    </div>
  );
}
