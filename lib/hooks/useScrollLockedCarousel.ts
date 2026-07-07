"use client";

import { useEffect, type RefObject } from "react";
import type { MotionValue } from "motion/react";
import { useLenis } from "@/components/shared/SmoothScrollProvider";
import { scrollCarousel } from "@/lib/motion";

type Options = {
  /** Elemen yang diamati — lock aktif saat hampir seluruhnya terlihat */
  targetRef: RefObject<HTMLElement | null>;
  /** Rotasi cylinder (derajat) — di-drive langsung oleh wheel delta */
  rotation: MotionValue<number>;
  faceCount: number;
  /** false = hook mati total (mobile/tablet, reduced motion, <2 produk) */
  enabled: boolean;
  /** Dipanggil saat lock mulai — kesempatan menghentikan animasi lain */
  onEngage?: () => void;
};

/**
 * Wheel → rotasi carousel dengan scroll-lock (REFACTOR-03), desktop-only.
 *
 * Saat section hampir penuh di viewport: Lenis di-stop + wheel di-
 * preventDefault, deltanya diakumulasi jadi rotasi. Lock lepas ketika:
 * satu putaran penuh selesai, user scroll ke atas di posisi awal,
 * atau melewati batas waktu (escape hatch — jangan pernah jebak user).
 * Keyboard/scrollbar sengaja TIDAK di-intercept: jalur kabur tambahan.
 */
export function useScrollLockedCarousel({
  targetRef,
  rotation,
  faceCount,
  enabled,
  onEngage,
}: Options): void {
  const lenis = useLenis();

  useEffect(() => {
    const el = targetRef.current;
    if (!el || !enabled || faceCount < 2) return;

    const budget = scrollCarousel.wheelPerFace * faceCount;
    let engaged = false;
    /** Sudah menyelesaikan lock untuk kunjungan viewport ini */
    let completed = false;
    let accum = 0;
    let startRotation = 0;
    let timeoutId = 0;

    const release = (markCompleted: boolean) => {
      if (!engaged) return;
      engaged = false;
      completed = markCompleted;
      window.clearTimeout(timeoutId);
      window.removeEventListener("wheel", onWheel);
      lenis?.start();
    };

    const onWheel = (e: WheelEvent) => {
      if (!engaged) return;
      // Scroll ke atas di titik awal = user mau keluar ke atas — lepaskan
      if (accum <= 0 && e.deltaY < 0) {
        release(false);
        return;
      }
      e.preventDefault();
      accum = Math.max(0, accum + e.deltaY);
      const progress = Math.min(accum / budget, 1);
      rotation.set(startRotation - progress * 360);
      if (progress >= 1) release(true);
    };

    const engage = () => {
      if (engaged || completed) return;
      engaged = true;
      accum = 0;
      startRotation = rotation.get();
      onEngage?.();
      lenis?.stop();
      window.addEventListener("wheel", onWheel, { passive: false });
      timeoutId = window.setTimeout(
        () => release(true),
        scrollCarousel.maxLockMs,
      );
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.intersectionRatio >= scrollCarousel.engageRatio) {
          engage();
        } else if (entry.intersectionRatio <= scrollCarousel.resetRatio) {
          // Section hampir keluar — lepaskan kalau masih ke-lock,
          // dan persenjatai ulang untuk kunjungan berikutnya
          release(false);
          completed = false;
        }
      },
      {
        threshold: [scrollCarousel.resetRatio, scrollCarousel.engageRatio],
      },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      release(false);
    };
  }, [targetRef, rotation, faceCount, enabled, lenis, onEngage]);
}
