"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { stackShrink } from "@/lib/motion";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { cn } from "@/lib/utils";

/**
 * Progress 0→1 panel ini tertimpa section berikutnya.
 * Section di dalam panel bisa pakai ini untuk efek internal
 * (mis. hero crossfade saat pinned — rect sticky beku, useScroll biasa mati).
 */
const StackProgressContext = createContext<MotionValue<number> | null>(null);

export function useStackProgress(): MotionValue<number> | null {
  return useContext(StackProgressContext);
}

type StackPanelProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * Sticky-stack ala Lusion/oryzo.ai: panel scroll masuk normal (konten
 * setinggi apa pun tetap kebaca), lalu pin dengan bottom nempel viewport
 * bottom (`top: 100svh - tinggi`), dan section berikutnya menimpanya —
 * panel yang tertimpa menyusut + meredup, scroll-linked via Lenis.
 *
 * WAJIB jadi anak langsung dari satu container `relative` bersama
 * panel-panel lain (sticky bound = container itu).
 */
export function StackPanel({ children, className }: StackPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [panelHeight, setPanelHeight] = useState(0);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  // Tinggi panel menentukan titik pin — panel lebih tinggi dari viewport
  // pin belakangan (setelah kontennya habis dibaca)
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry) setPanelHeight(entry.contentRect.height);
    });
    ro.observe(panel);
    return () => ro.disconnect();
  }, []);

  // Sentinel (h-0, tepat setelah panel) tetap bergerak normal saat panel
  // pinned — jadi sumber progress "sedang ditimpa"
  const { scrollYProgress } = useScroll({
    target: sentinelRef,
    offset: ["start end", "start start"],
  });
  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    [1, stackShrink.scale],
  );
  const dim = useTransform(scrollYProgress, [0, 1], [0, stackShrink.dim]);

  return (
    <>
      <div
        ref={panelRef}
        className={cn(!reducedMotion && "sticky", className)}
        style={
          reducedMotion
            ? undefined
            : // Sebelum ResizeObserver jalan (paint pertama) pakai top:0
              // supaya panel pertama tidak kedorong ke bawah
              { top: panelHeight ? `calc(100svh - ${panelHeight}px)` : 0 }
        }
      >
        <motion.div
          style={reducedMotion ? undefined : { scale }}
          className="relative"
        >
          <StackProgressContext.Provider value={scrollYProgress}>
            {children}
          </StackProgressContext.Provider>
          {!reducedMotion && (
            <motion.div
              aria-hidden="true"
              style={{ opacity: dim }}
              className="pointer-events-none absolute inset-0 z-50 bg-surface-lowest"
            />
          )}
        </motion.div>
      </div>
      <div ref={sentinelRef} aria-hidden="true" className="h-0" />
    </>
  );
}
