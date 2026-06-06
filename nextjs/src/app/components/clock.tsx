"use client";
import React, { useEffect, useState } from "react";

export default function Clock() {
  const [clockTime, setClockTime] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      setClockTime(
        `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
          2,
          "0"
        )}:${String(seconds).padStart(2, "0")}`
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      id="clock"
      className="text-center text-base font-bold tabular-nums tracking-wide text-tfl-amber"
      suppressHydrationWarning
    >
      {clockTime}
    </div>
  );
}
