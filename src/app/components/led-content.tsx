"use client";
import { StopData } from "@/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import React, { useMemo, useState } from "react";
import Clock from "./clock";

export default function LedContent() {
  const [activeTimetableIndex, setActiveTimetableIndex] = useState<number>(0);

  const { data } = useQuery({
    queryKey: ["ARRIVALS"],
    queryFn: () => axios.get("/api/updateArrivals"),
    refetchInterval: 5000,
  });

  const onChangeStop = () => {
    setActiveTimetableIndex(
      (prev) => (prev + 1) % (data?.data.stops.length ?? 0)
    );
  };

  const stop: StopData = useMemo(
    () => data?.data.stops[activeTimetableIndex],
    [data, activeTimetableIndex]
  );
  return (
    <div
      onClick={onChangeStop}
      className="h-[90vh] flex flex-col justify-center"
    >
      <div id="arrivals" className="font-heavy">
        <div className="timetable-container" key={stop?.stop_id}>
          <div className="stop-title arrivals-item text--heavy">
            {stop?.title}
          </div>
          {stop?.arrivals?.slice(0, 3).map((arrival, index) => (
            <div key={index} className="arrival-item">
              <div className="order">{index + 1}</div>
              <div className="line-name">{arrival.lineName}</div>
              <div className="destination">
                <div className="destination-text">
                  {arrival.destinationName}
                </div>
              </div>
              <div className="time-to-station">{arrival.timeToStationMins}</div>
            </div>
          ))}
        </div>
      </div>
      <Clock />
    </div>
  );
}
