"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { MotionConfig } from "motion/react";
import "lenis/dist/lenis.css";
import { lenisLerp } from "@/lib/motion";

/**
 * Lenis smooth scroll global (DESIGN.md §6).
 * Lenis menganimasikan native scroll, jadi `useScroll`/`useTransform`
 * Framer Motion tetap sinkron tanpa wiring tambahan.
 *
 * MotionConfig reducedMotion="user" = guard global: semua komponen motion
 * otomatis mematikan animasi transform saat prefers-reduced-motion.
 */
export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Reduced motion → biarkan native scroll, jangan init Lenis sama sekali
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = new Lenis({ lerp: lenisLerp });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
