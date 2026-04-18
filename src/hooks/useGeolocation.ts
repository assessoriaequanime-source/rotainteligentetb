import { useCallback, useEffect, useRef, useState } from "react";

export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy: number; // metros
  speed: number | null; // m/s
  heading: number | null; // graus
  timestamp: number;
}

export interface GeolocationState {
  position: GeoPosition | null;
  error: string | null;
  watching: boolean;
  supported: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    watching: false,
    supported:
      typeof navigator !== "undefined" && "geolocation" in navigator,
  });
  const watchIdRef = useRef<number | null>(null);

  const start = useCallback(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setState((s) => ({ ...s, error: "GPS não suportado neste dispositivo", supported: false }));
      return;
    }
    if (watchIdRef.current !== null) return;

    setState((s) => ({ ...s, error: null, watching: true }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setState((s) => ({
          ...s,
          error: null,
          position: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            speed: pos.coords.speed,
            heading: pos.coords.heading,
            timestamp: pos.timestamp,
          },
        }));
      },
      (err) => {
        const msgMap: Record<number, string> = {
          1: "Permissão de localização negada",
          2: "Localização indisponível",
          3: "Tempo esgotado ao obter localização",
        };
        setState((s) => ({
          ...s,
          error: msgMap[err.code] || err.message || "Erro de GPS",
          watching: false,
        }));
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 15000,
      },
    );
  }, []);

  const stop = useCallback(() => {
    if (watchIdRef.current !== null && typeof navigator !== "undefined") {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setState((s) => ({ ...s, watching: false }));
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null && typeof navigator !== "undefined") {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return { ...state, start, stop };
}

/**
 * Distância em metros entre dois pontos (Haversine).
 */
export function distanceMeters(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
