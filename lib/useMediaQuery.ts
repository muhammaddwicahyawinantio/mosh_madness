"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Media query sebagai external store — SSR-safe, tanpa setState-in-effect.
 * `serverDefault` dipakai saat render server / sebelum hydration.
 */
export function useMediaQuery(query: string, serverDefault = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverDefault,
  );
}
