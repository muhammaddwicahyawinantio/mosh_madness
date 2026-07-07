"use client";

import { useEffect, type RefObject } from "react";
import { useMotionValue, type MotionValue } from "motion/react";
import { useLenis } from "@/components/shared/SmoothScrollProvider";

/**
 * Progress 0→1 selama sebuah section melintasi rentang pin-nya
 * (tinggi section − 1 viewport). Sumber scroll = event Lenis
 * (`animatedScroll`, lihat lenis.dev) dengan fallback native scroll —
 * keduanya jalan di mobile. Re-measure via ResizeObserver.
 *
 * `enabled=false` → MotionValue diam di 0 (dipakai jalur reduced-motion
 * statis). Scroll-LINKED, bukan scroll-lock: tidak pernah menahan scroll
 * user, jadi aman di sentuh/mobile.
 */
export function useSectionProgress(
  ref: RefObject<HTMLElement | null>,
  enabled = true,
): MotionValue<number> {
  const progress = useMotionValue(0);
  const lenis = useLenis();

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    let top = 0;
    let distance = 1;
    const measure = () => {
      const rect = el.getBoundingClientRect();
      top = rect.top + window.scrollY; // offset absolut dokumen
      distance = Math.max(1, el.offsetHeight - window.innerHeight);
    };
    const update = () => {
      const scroll = lenis ? lenis.scroll : window.scrollY;
      const p = (scroll - top) / distance;
      progress.set(p < 0 ? 0 : p > 1 ? 1 : p);
    };

    measure();
    update();

    if (lenis) lenis.on("scroll", update);
    else window.addEventListener("scroll", update, { passive: true });

    const ro = new ResizeObserver(() => {
      measure();
      update();
    });
    ro.observe(el);

    return () => {
      if (lenis) lenis.off("scroll", update);
      else window.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, [ref, enabled, lenis, progress]);

  return progress;
}
