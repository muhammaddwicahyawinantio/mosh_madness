"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Kirim visit ke /api/track — sekali per path per session (dedupe via
 * sessionStorage, PLAN Phase 2). Render null, tidak menyentuh UI.
 */
export function TrackVisit() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    const key = `mm-tracked:${pathname}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");

    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname }),
      keepalive: true,
    }).catch(() => {
      // Gagal (offline dsb) → lepas kunci supaya kepencatat di navigasi berikutnya
      sessionStorage.removeItem(key);
    });
  }, [pathname]);

  return null;
}
