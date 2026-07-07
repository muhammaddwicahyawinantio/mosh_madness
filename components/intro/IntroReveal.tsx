"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion } from "motion/react";
import { SplitText } from "@/components/shared/SplitText";
import { ASSETS, BRAND } from "@/lib/constants";
import { useMediaQuery } from "@/lib/useMediaQuery";
import {
  duration,
  easeBrand,
  easeSharp,
  staggerChar,
} from "@/lib/motion";

/* Timeline intro (detik) — REVISI: hold diperpanjang (intro sedikit
   lebih lama, permintaan Ilham) dari 0.4 → 0.9, total ~2.5s */
const WORDMARK_DELAY = 0.15;
const HOLD = 0.9;
const CHAR_COUNT = "MOSH MADNESS".length;
const REVEAL_END =
  WORDMARK_DELAY + CHAR_COUNT * staggerChar + duration.base;

/* Logo mitra di ujung kiri bawah intro — chip bulat kecil.
   Polihasnur: file wide, crop kiri = emblem bundarnya. */
const INTRO_LOGOS = [
  {
    src: ASSETS.sponsor.himati,
    alt: "HIMA TI Politeknik Hasnur",
    fit: "object-contain p-1",
  },
  {
    src: ASSETS.sponsor.polihasnur,
    alt: "Politeknik Hasnur",
    fit: "object-cover object-left",
  },
  {
    src: ASSETS.sponsor.dwiscript,
    alt: "Dwiscript",
    fit: "object-contain p-0.5",
  },
] as const;

/**
 * Intro reveal — REVISI: WAJIB tampil setiap kali halaman home dimuat/
 * di-reload (gating sessionStorage "sekali per session" DIHAPUS atas
 * permintaan Ilham). Hanya untuk load awal di home ("/") — halaman lain
 * dan navigasi client-side tidak memutar intro.
 * Overlay hitam penuh, wordmark naik per karakter (SplitText), lalu
 * overlay wipe ke atas membuka hero. Reduced motion = fade cepat tanpa
 * stagger. Overlay pointer-events-none — murni visual, tidak pernah
 * memblokir interaksi.
 */
export function IntroReveal() {
  const pathname = usePathname();
  // Path saat mount pertama — intro hanya untuk full load yang mendarat
  // di home, bukan tiap navigasi client-side kembali ke "/"
  const [initialPath] = useState(pathname);
  const reduced = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [done, setDone] = useState(false);

  if (initialPath !== "/" || done) return null;

  const finish = () => setDone(true);

  // Reduced motion: tampil singkat lalu fade — total < 400ms, tanpa stagger
  if (reduced) {
    return (
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[100] flex items-center justify-center bg-surface-lowest"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        onAnimationComplete={finish}
      >
        <span className="type-headline-lg text-primary">{BRAND.name}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] flex flex-col items-center justify-center bg-surface-lowest"
      initial={{ clipPath: "inset(0% 0% 0% 0%)" }}
      animate={{ clipPath: "inset(0% 0% 100% 0%)" }}
      transition={{
        delay: REVEAL_END + HOLD,
        duration: duration.slow * 0.7,
        ease: easeSharp,
      }}
      onAnimationComplete={finish}
    >
      {/* Konten ikut terangkat saat wipe — satu gerakan, bukan dua */}
      <motion.div
        className="flex flex-col items-center gap-4"
        animate={{ y: "-12vh" }}
        transition={{
          delay: REVEAL_END + HOLD,
          duration: duration.slow * 0.7,
          ease: easeSharp,
        }}
      >
        <h2 className="type-display-xl text-primary">
          <SplitText
            text="MOSH MADNESS"
            onView={false}
            delay={WORDMARK_DELAY}
          />
        </h2>
        <motion.p
          className="type-label text-on-surface-variant"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            delay: REVEAL_END * 0.8,
            duration: duration.base,
            ease: easeBrand,
          }}
        >
          {BRAND.estCode} / {BRAND.sku} / BANJARMASIN
        </motion.p>
      </motion.div>

      {/* Logo mitra — ujung kiri bawah, chip bulat kecil (REVISI intro).
          Ikut terangkat wipe overlay saat intro selesai. */}
      <motion.div
        className="absolute bottom-6 left-6 flex items-center gap-3 md:bottom-8 md:left-8"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: WORDMARK_DELAY + 0.25,
          duration: duration.base,
          ease: easeBrand,
        }}
      >
        {INTRO_LOGOS.map((logo) => (
          <span
            key={logo.src}
            className="relative block h-10 w-10 overflow-hidden rounded-full bg-white/95"
          >
            <Image
              src={logo.src}
              alt={logo.alt}
              fill
              sizes="40px"
              className={logo.fit}
            />
          </span>
        ))}
      </motion.div>
    </motion.div>
  );
}
