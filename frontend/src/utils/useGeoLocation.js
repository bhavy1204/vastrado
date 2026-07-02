import { useState, useCallback } from "react";

// Usage:
//   const { coords, error, isLoading, requestLocation } = useGeolocation();
//   <button onClick={requestLocation}>Find Sellers Near Me</button>

export default function useGeolocation() {
  const [coords, setCoords] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setIsLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLoading(false);
      },
      (err) => {
        // err.code: 1 = permission denied, 2 = position unavailable, 3 = timeout
        const message =
          err.code === 1
            ? "Location permission denied. Enable it in browser settings."
            : "Could not get your location. Try again.";
        setError(message);
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return { coords, error, isLoading, requestLocation };
}



