"use client";

import { useMemo, useRef } from "react";
import Image from "next/image";
import { motion, useTransform, type MotionValue } from "motion/react";
import { AutoVideo } from "@/components/shared/AutoVideo";
import { useLenis } from "@/components/shared/SmoothScrollProvider";
import { useSectionProgress } from "@/lib/hooks/useSectionProgress";
import { ASSETS, BRAND } from "@/lib/constants";
import { useMediaQuery } from "@/lib/useMediaQuery";

const ABOUT_VIDEO = "/assets/about/vidsectionabout.mp4";

/**
 * Peta progress pin (0→1) ke tiga momen (FRONTEND.md §2.2):
 * intro copy fade-in → intro fade-out & video fade-in → writer per kata.
 */
const PHASE = {
  introCopyIn: [0.0, 0.08] as [number, number],
  crossfade: [0.28, 0.42] as [number, number],
  writer: [0.44, 0.98] as [number, number],
};

type AboutSectionProps = {
  /** Teks manifesto (SiteContent `about.writer`) — paragraf dipisah \n */
  writer: string;
};

/**
 * S2 About — REBUILD P7 (FRONTEND.md §2.2). Satu pin sticky non-nested
 * (section ini BUKAN anak StackPanel — menghindari sticky-in-sticky yang
 * bikin progress scroll mati). Progress di-drive langsung oleh event
 * scroll Lenis (lenis.on('scroll') → MotionValue), lihat lenis.dev.
 * Fase: (1) intro `about-section.png` + teks besar, (2) crossfade ke
 * video loop + writer per kata. Gate = tinggi container; tombol Skip
 * melompati pin. Mobile & reduced-motion: TANPA lock, dua blok statis.
 */
export function AboutSection({ writer }: AboutSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const lenis = useLenis();
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  // Animasi jalan di mobile & desktop (scroll-linked, aman di sentuh);
  // hanya reduced-motion yang dapat versi statis
  const animate = !reducedMotion;

  // Progress 0→1 melintasi tinggi section, dari event scroll Lenis
  const progress = useSectionProgress(sectionRef, animate);

  const introOpacity = useTransform(progress, PHASE.crossfade, [1, 0]);
  const introCopyOpacity = useTransform(progress, PHASE.introCopyIn, [0, 1]);
  const introScale = useTransform(progress, [0, PHASE.crossfade[1]], [1.06, 1]);
  const videoOpacity = useTransform(progress, PHASE.crossfade, [0, 1]);

  /** Paragraf → kata, dengan index global untuk mapping progress */
  const paragraphs = useMemo(() => {
    let index = 0;
    return writer
      .split(/\n+/)
      .filter((p) => p.trim().length > 0)
      .map((p) => p.split(/\s+/).map((word) => ({ word, index: index++ })));
  }, [writer]);
  const totalWords = paragraphs.reduce((n, words) => n + words.length, 0);

  const skipToEnd = () => {
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const target = window.scrollY + rect.bottom - window.innerHeight;
    if (lenis) lenis.scrollTo(target, { duration: 1.2 });
    else window.scrollTo({ top: target, behavior: "smooth" });
  };

  // ---------- Reduced-motion: tanpa lock, dua blok statis ----------
  if (!animate) {
    return (
      <section ref={sectionRef} id="about" aria-label="Tentang Mosh Madness">
        {/* Fase 1 statis — png + teks */}
        <div className="relative flex min-h-svh items-center justify-center overflow-hidden">
          <Image src={ASSETS.about} alt="" fill sizes="100vw" className="object-cover" />
          <div aria-hidden="true" className="absolute inset-0 bg-surface-lowest/60" />
          <AboutIntroCopy />
        </div>
        {/* Fase 2 statis — video + teks penuh */}
        <div className="relative overflow-hidden bg-surface-lowest">
          <AutoVideo src={ABOUT_VIDEO} className="absolute inset-0 h-full w-full" />
          <div aria-hidden="true" className="absolute inset-0 bg-surface-lowest/70" />
          <div className="relative mx-auto max-w-3xl px-4 py-32 md:px-8">
            <p className="type-label mb-8 text-accent-666">001 / Manifesto</p>
            {writer.split(/\n+/).map((p, i) => (
              <p key={i} className="type-body-lg mb-5 text-on-surface">
                {p}
              </p>
            ))}
            <p className="type-label mt-10 text-on-surface-variant">
              {BRAND.sku} — {BRAND.location}
            </p>
          </div>
        </div>
      </section>
    );
  }

  // ---------- Desktop: pin sticky non-nested, 2 fase ----------
  return (
    <section
      ref={sectionRef}
      id="about"
      aria-label="Tentang Mosh Madness"
      className="relative h-[300vh] bg-surface-lowest"
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* Fase 2 — video + writer (lapisan bawah) */}
        <motion.div style={{ opacity: videoOpacity }} className="absolute inset-0">
          <AutoVideo src={ABOUT_VIDEO} className="absolute inset-0 h-full w-full" />
          <div aria-hidden="true" className="absolute inset-0 bg-surface-lowest/70" />
          <div className="relative flex h-full items-center">
            <div className="mx-auto w-full max-w-3xl px-4 md:px-8">
              <p className="type-label mb-8 text-accent-666">001 / Manifesto</p>
              {paragraphs.map((words, pi) => (
                <p key={pi} className="type-body-lg mb-5 text-on-surface">
                  {words.map(({ word, index }) => (
                    <WriterWord
                      key={index}
                      word={word}
                      progress={progress}
                      range={wordRange(index, totalWords)}
                    />
                  ))}
                </p>
              ))}
              <p className="type-label mt-10 text-on-surface-variant">
                {BRAND.sku} — {BRAND.location}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Fase 1 — intro png + teks besar (lapisan atas, fade out) */}
        <motion.div
          style={{ opacity: introOpacity }}
          className="pointer-events-none absolute inset-0"
        >
          <motion.div style={{ scale: introScale }} className="absolute inset-0">
            <Image src={ASSETS.about} alt="" fill sizes="100vw" className="object-cover" />
          </motion.div>
          <div aria-hidden="true" className="absolute inset-0 bg-surface-lowest/60" />
          <motion.div style={{ opacity: introCopyOpacity }} className="absolute inset-0">
            <AboutIntroCopy />
          </motion.div>
        </motion.div>

        {/* Skip — lompati pin (FRONTEND.md §2.2 gate + skip) */}
        <button
          type="button"
          onClick={skipToEnd}
          className="type-label absolute bottom-6 right-4 z-10 border border-outline-variant bg-surface-lowest/80 px-4 py-2 text-on-surface-variant hover:border-primary hover:text-primary md:right-8"
        >
          Skip ↓
        </button>
      </div>
    </section>
  );
}

/** Rentang progress satu kata di dalam window writer */
function wordRange(index: number, total: number): [number, number] {
  const [start, end] = PHASE.writer;
  const span = (end - start) / Math.max(total, 1);
  return [start + index * span, start + (index + 1) * span];
}

function WriterWord({
  word,
  progress,
  range,
}: {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.15, 1]);
  return <motion.span style={{ opacity }}>{word} </motion.span>;
}

/** Teks intro fase 1 — MOSH MADNESS + ABOUT + aksen 666 (spec §2.2) */
function AboutIntroCopy() {
  return (
    <div className="relative flex h-full min-h-svh flex-col items-center justify-center px-4 text-center">
      <p className="type-label mb-6 text-on-surface-variant">
        {BRAND.estCode} — Banjarmasin
      </p>
      <h2 className="type-display-xl text-primary">Mosh Madness</h2>
      <p className="type-headline-lg mt-4 text-primary">
        About <span className="text-accent-666">/ 666</span>
      </p>
    </div>
  );
}
