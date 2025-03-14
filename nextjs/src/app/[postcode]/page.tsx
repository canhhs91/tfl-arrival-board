"use client";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import LedContent from "../components/led-content";

const Page = () => {
  const { postcode } = useParams();
  return (
    <div className="led-matrix">
      <div className="text text-regular">
        <Suspense fallback={<div>Loading...</div>}>
          <LedContent postcode={postcode as string} />
        </Suspense>
      </div>
    </div>
  );
};

export default Page;
