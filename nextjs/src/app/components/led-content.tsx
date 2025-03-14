"use client";
import { StopData } from "@/types";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import Clock from "./clock";
import useLatLong from "@/hooks/useLatLong";
import { getStopPoints } from "@/actions";
import { QUERY_KEYS } from "@/constants";
// import { formatDistanceToNow } from "date-fns";
import Arrivals from "./arrivals";

export default function LedContent({ postcode }: { postcode: string | null }) {
  //
  const { latitude, longitude } = useLatLong(postcode);
  const [activeTimetableIndex, setActiveTimetableIndex] = useState<number>(0);

  const { data } = useQuery({
    queryKey: [QUERY_KEYS.STOPS, latitude, longitude],
    queryFn: () => getStopPoints({ lat: latitude, long: longitude }),
  });

  const onChangeStop = () => {
    setActiveTimetableIndex((prev) => (prev + 1) % (data?.stops?.length ?? 0));
  };

  const stop: StopData | undefined = useMemo(
    () => data?.stops[activeTimetableIndex],
    [data, activeTimetableIndex]
  );

  // Custom House (stop G)
  //  split Custom House and stop G
  let [title, stopLetter] = [stop?.title, ""];

  const pattern = /(.*)\s(\(Stop\s[A-Z]\))/;
  const match = stop?.title.match(pattern);
  console.log("canhtest match", match);
  if (match) {
    [, title, stopLetter] = match;
  }
  return (
    <div
      onClick={onChangeStop}
      className="h-[90vh] flex flex-col justify-center"
    >
      <div id="arrivals" className="font-regular text-sm">
        <div className="timetable-container" key={stop?.stop_id}>
          <div className="gap-1 flex flex-row justify-center w-full">
            <span className="text--heavy overflow-hidden text-ellipsis">
              {title}
            </span>
            <span className=" text--heavy">{stopLetter}</span>
          </div>
          {/* {
            dataUpdatedAt ?
              <div className="text-xs  text-[#ffc80a]  font-semibold">
                Updated {formatDistanceToNow(dataUpdatedAt, { addSuffix: true })}
              </div>
              : null
          } */}
          <Arrivals stop_id={stop?.stop_id} />
        </div>
      </div>
      <Clock />
    </div>
  );
}
