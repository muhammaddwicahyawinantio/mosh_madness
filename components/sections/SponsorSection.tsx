"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useInView } from "motion/react";
import { SafeImage } from "@/components/shared/SafeImage";
import { ASSETS, BRAND } from "@/lib/constants";
import {
  revealStagger,
  revealUp,
  viewportOnce,
  wipeFromLeft,
  wipeFromRight,
} from "@/lib/motion";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { useWebGLSupport } from "@/lib/webgl";

// three hanya dimuat client-side, dan hanya saat section mendekat
const SponsorScene = dynamic(() => import("./SponsorScene"), { ssr: false });

/** Urutan final (REFACTOR-04): Politeknik Hasnur kiri, HIMA TI kanan */
const LOGOS = [
  { url: ASSETS.sponsor.polihasnur, label: "Politeknik Hasnur" },
  { url: ASSETS.sponsor.himati, label: "HIMA TI" },
];

/**
 * S5 Sponsor — R3F lazy mount saat in-view (DESIGN.md §6 hard rules).
 * Reduced motion / sebelum mount: logo statis via SafeImage.
 */
export function SponsorSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapperRef, { margin: "200px 0px" });
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  // Tilt-on-pointer tidak bermakna di touch (REFACTOR-04) — fallback
  // statis + wipe reveal per sisi
  const hoverCapable = useMediaQuery("(hover: hover)", true);
  const webglOk = useWebGLSupport();

  // Mount sekali saat pertama kali mendekati viewport, jangan unmount lagi
  // (pattern "storing information from previous renders", bukan effect)
  const [mounted, setMounted] = useState(false);
  if (inView && !mounted) setMounted(true);

  const show3d = mounted && !reducedMotion && hoverCapable && webglOk;

  return (
    <section
      id="sponsor"
      aria-label="Didukung oleh"
      className="border-t border-outline-variant bg-surface-low"
    >
      <motion.div
        variants={revealStagger}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="mx-auto max-w-[1600px] px-4 py-24 md:px-8"
      >
        <motion.p
          variants={revealUp}
          className="type-label mb-2 text-accent-666"
        >
          004 / Didukung oleh
        </motion.p>
        <motion.h2
          variants={revealUp}
          className="type-headline-md text-on-surface-variant"
        >
          Berdiri bareng barisan
        </motion.h2>

        <motion.div
          variants={revealUp}
          ref={wrapperRef}
          className="mt-10 h-[300px] md:h-[380px]"
        >
          {show3d ? (
            <SponsorScene logos={LOGOS} active={inView} />
          ) : (
            // Fallback touch/reduced/no-WebGL: stack vertikal di mobile,
            // wipe masuk dari sisi masing-masing (REFACTOR-04 opsi 1)
            <div className="flex h-full flex-col items-center justify-center gap-10 md:flex-row md:gap-0">
              {LOGOS.map((logo, i) => (
                <motion.div
                  key={logo.url}
                  variants={
                    reducedMotion
                      ? undefined
                      : i === 0
                        ? wipeFromLeft
                        : wipeFromRight
                  }
                  initial={reducedMotion ? undefined : "hidden"}
                  whileInView={reducedMotion ? undefined : "visible"}
                  viewport={viewportOnce}
                  className="flex flex-1 items-center justify-center md:first:border-r md:first:border-outline-variant"
                >
                  <SafeImage
                    src={logo.url}
                    alt={logo.label}
                    width={220}
                    height={220}
                    className="h-auto w-36 object-contain md:w-52"
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div
          variants={revealUp}
          className="mt-6 flex justify-center gap-12 md:gap-20"
        >
          {LOGOS.map((logo) => (
            <p key={logo.label} className="type-label text-outline">
              {logo.label}
            </p>
          ))}
        </motion.div>

        <motion.p
          variants={revealUp}
          className="type-label mt-12 text-center text-outline-variant"
        >
          {BRAND.sku} / {BRAND.estCode} / {BRAND.location}
        </motion.p>
      </motion.div>
    </section>
  );
}
