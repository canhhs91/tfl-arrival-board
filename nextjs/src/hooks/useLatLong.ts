"use client";

import { useEffect, useState } from "react";

export default function useLatLong(postcode: string | null) {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoordinates = async () => {
      if (postcode) {
        try {
          const response = await fetch(
            `https://api.postcodes.io/postcodes/${postcode}`
          );
          const data = await response.json();

          if (response.ok && data.result) {
            setLatitude(data.result.latitude);
            setLongitude(data.result.longitude);
          } else {
            setError("Error fetching postcode data");
            fallbackToGeolocation();
          }
        } catch {
          setError("Error fetching postcode data");
          fallbackToGeolocation();
        }
      } else {
        fallbackToGeolocation();
      }
    };

    const fallbackToGeolocation = () => {
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
    };

    fetchCoordinates();
  }, [postcode]);

  return { latitude, longitude, error };
}
