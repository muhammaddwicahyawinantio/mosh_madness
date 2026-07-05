"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { motion, useInView } from "motion/react";
import { SafeImage } from "@/components/shared/SafeImage";
import { ASSETS, BRAND } from "@/lib/constants";
import { revealStagger, revealUp, viewportOnce } from "@/lib/motion";
import { useMediaQuery } from "@/lib/useMediaQuery";

// three hanya dimuat client-side, dan hanya saat section mendekat
const SponsorScene = dynamic(() => import("./SponsorScene"), { ssr: false });

const LOGOS = [
  { url: ASSETS.sponsor.himati, label: "HIMATI" },
  { url: ASSETS.sponsor.polihasnur, label: "Politeknik Hasnur" },
];

/**
 * S5 Sponsor — R3F lazy mount saat in-view (DESIGN.md §6 hard rules).
 * Reduced motion / sebelum mount: logo statis via SafeImage.
 */
export function SponsorSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inView = useInView(wrapperRef, { margin: "200px 0px" });
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  // Mount sekali saat pertama kali mendekati viewport, jangan unmount lagi
  // (pattern "storing information from previous renders", bukan effect)
  const [mounted, setMounted] = useState(false);
  if (inView && !mounted) setMounted(true);

  const show3d = mounted && !reducedMotion;

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
            <div className="flex h-full items-center justify-center gap-12 md:gap-20">
              {LOGOS.map((logo) => (
                <SafeImage
                  key={logo.url}
                  src={logo.url}
                  alt={logo.label}
                  width={220}
                  height={220}
                  className="h-auto w-36 object-contain md:w-52"
                />
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
