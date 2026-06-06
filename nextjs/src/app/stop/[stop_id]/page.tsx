import { Suspense } from "react";
import StopBoard from "./stop-board";

export default function StopPage() {
  return (
    <div className="app-shell h-dvh">
      <div className="flex min-h-0 flex-1 flex-col">
        <Suspense fallback={<div className="text-tfl-muted">Loading…</div>}>
          <StopBoard />
        </Suspense>
      </div>
    </div>
  );
}
