"use client";

import { motion } from "motion/react";
import { AutoVideo } from "@/components/shared/AutoVideo";
import { easeBrand, duration, viewportOnce, wipeUp } from "@/lib/motion";

/**
 * 2 video card dekoratif di halaman /contact.
 *
 * - kiri.mp4: pojok kiri-atas halaman
 * - kanan.mp4: pojok kanan-bawah halaman
 * - pointer-events-none → TIDAK menutupi form
 * - absolute/fixed di level halaman, bukan di dalam section
 * - Mobile: lebih kecil (w-28), di pojok, semi-transparan
 * - Desktop: lebih besar (w-48), posisi jelas
 */
export function ContactPageReels() {
  return (
    <>
      {/* kiri.mp4 — kiri atas */}
      <motion.figure
        variants={wipeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        aria-hidden="true"
        className="pointer-events-none absolute left-2 top-20 z-10 w-28 border border-outline-variant bg-white/5 p-1.5 backdrop-blur-sm md:left-4 md:top-24 md:w-40 lg:left-6 lg:w-48 lg:p-2"
      >
        <AutoVideo
          src="/assets/videos/kiri.mp4"
          eager
          className="aspect-video w-full border border-outline-variant"
        />
        <figcaption className="type-label px-1 pb-0.5 pt-1.5 text-[10px] text-on-surface-variant md:text-xs">
          Reel / Mosh — 666
        </figcaption>
      </motion.figure>

      {/* kanan.mp4 — kanan bawah */}
      <motion.figure
        variants={wipeUp}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        aria-hidden="true"
        className="pointer-events-none absolute bottom-16 right-2 z-10 w-28 border border-outline-variant bg-white/5 p-1.5 backdrop-blur-sm md:bottom-20 md:right-4 md:w-40 lg:bottom-24 lg:right-6 lg:w-48 lg:p-2"
      >
        <AutoVideo
          src="/assets/videos/kanan.mp4"
          eager
          className="aspect-video w-full border border-outline-variant"
        />
        <figcaption className="type-label px-1 pb-0.5 pt-1.5 text-[10px] text-on-surface-variant md:text-xs">
          Reel / Madness — 666
        </figcaption>
      </motion.figure>
    </>
  );
}
