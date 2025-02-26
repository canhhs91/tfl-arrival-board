import { Suspense } from "react";
import LedContent from "./components/led-content";

export default function Home() {
  return (
    <div className="led-matrix">
      <div className="text text-regular">
        <Suspense fallback={<div>Loading...</div>}>
          <LedContent />
        </Suspense>
      </div>
    </div>
  );
}
