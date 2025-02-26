"use client";

import { useEffect, useState } from "react";

export default function useLatLong(postcode: string | null) {

  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (postcode) {
      // get lat lon from https://api.postcodes.io/postcodes/E163SZ
      fetch(`https://api.postcodes.io/postcodes/${postcode}`)
        .then((response) => response.json())
        .then((data) => {
          setLatitude(data.result.latitude);
          setLongitude(data.result.longitude);
        });
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLatitude(position.coords.latitude);
            setLongitude(position.coords.longitude);
          },
          (error) => {
            setError(error.message);
          }
        );
      } else {
        setError("Geolocation is not supported by your browser.");
      }
    }
  }, [postcode]);
  return { latitude, longitude, error };
}
