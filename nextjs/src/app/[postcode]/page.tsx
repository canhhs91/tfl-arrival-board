"use client";
import { useParams } from "next/navigation";
import { Suspense } from "react";
import LedContent from "../components/led-content";

const PostcodePage = () => {
  const { postcode } = useParams();
  return (
    <div className="app-shell">
      <Suspense fallback={<div className="text-tfl-muted">Loading…</div>}>
        <LedContent postcode={(postcode as string) ?? null} />
      </Suspense>
    </div>
  );
};

export default PostcodePage;
