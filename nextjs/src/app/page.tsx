"use client";
import { Suspense } from "react";
import LedContent from "./components/led-content";
import { useSearchParams } from "next/navigation";

export default function Home() {
  // get "poscode" from url param
  const searchParams = useSearchParams();

  const postcode = searchParams.get("postcode");
  return (
    <div className="led-matrix">
      <div className="text text-regular">
        <Suspense fallback={<div>Loading...</div>}>
          <LedContent postcode={postcode} />
        </Suspense>
      </div>
    </div>
  );
}
