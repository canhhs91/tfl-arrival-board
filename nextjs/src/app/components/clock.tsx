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
      const ampm = hours >= 12 ? "PM" : "AM";
      const formattedHours = hours % 12 || 12; // Convert 0 to 12 for 12-hour format
      setClockTime(
        `${String(formattedHours).padStart(2, "0")}:${String(minutes).padStart(
          2,
          "0"
        )}:${String(seconds).padStart(2, "0")} ${ampm}`
      );
    };

    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      id="clock"
      className="text-center text-sm font-medium tabular-nums tracking-wide text-tfl-muted"
      suppressHydrationWarning
    >
      {clockTime}
    </div>
  );
}
