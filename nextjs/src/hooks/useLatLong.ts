"use client";

import { useCallback, useEffect, useState } from "react";

export default function useLatLong(postcode: string | null) {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setLocating(false);
      },
      (err) => {
        setError(err.message);
        setLocating(false);
      }
    );
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetchCoordinates = async () => {
      if (postcode) {
        try {
          const response = await fetch(
            `https://api.postcodes.io/postcodes/${postcode}`
          );
          const data = await response.json();
          if (cancelled) return;
          if (response.ok && data.result) {
            setLatitude(data.result.latitude);
            setLongitude(data.result.longitude);
          } else {
            setError("Error fetching postcode data");
            locate();
          }
        } catch {
          if (cancelled) return;
          setError("Error fetching postcode data");
          locate();
        }
      } else {
        locate();
      }
    };

    fetchCoordinates();
    return () => {
      cancelled = true;
    };
  }, [postcode, locate]);

  return { latitude, longitude, error, locating, locate };
}
