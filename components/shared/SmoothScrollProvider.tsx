"use client";

import { useEffect, useSyncExternalStore } from "react";
import Lenis from "lenis";
import { MotionConfig } from "motion/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";
import { lenisLerp } from "@/lib/motion";

/**
 * Instance Lenis sebagai external store — dipakai fitur yang perlu
 * pause/resume smooth scroll (mis. scroll-locked carousel REFACTOR-03).
 * null saat reduced motion / belum mount / server.
 */
let lenisInstance: Lenis | null = null;
const listeners = new Set<() => void>();

function setLenisInstance(next: Lenis | null) {
  lenisInstance = next;
  for (const notify of listeners) notify();
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

export function useLenis(): Lenis | null {
  return useSyncExternalStore(
    subscribe,
    () => lenisInstance,
    () => null,
  );
}

/**
 * Lenis smooth scroll global (DESIGN.md §6).
 * Lenis menganimasikan native scroll, jadi `useScroll`/`useTransform`
 * Framer Motion tetap sinkron tanpa wiring tambahan.
 *
 * REFACTOR-06: Lenis di-drive gsap.ticker (satu otoritas rAF) dan
 * meneruskan event scroll-nya ke ScrollTrigger — section WebGL-heavy
 * membaca progress ScrollTrigger di render loop, bukan polling event
 * scroll native. Lenis tetap scroll engine, GSAP tidak menggantikannya.
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

    gsap.registerPlugin(ScrollTrigger);

    const instance = new Lenis({ lerp: lenisLerp });
    setLenisInstance(instance);

    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => {
      // gsap.ticker pakai detik — Lenis expect milidetik
      instance.raf(time * 1000);
    };
    gsap.ticker.add(tick);
    // Jangan biarkan GSAP "mengejar" frame drop — bikin lompatan scroll
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenisInstance(null);
    };
  }, []);

  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
