"use client";

import { useRef } from "react";
import { ArrowDown } from "lucide-react";
import { SafeImage } from "@/components/shared/SafeImage";
import { HeroBirds } from "@/components/sections/HeroBirds";
import { HeroReveal } from "@/components/sections/HeroReveal";
import { ASSETS, BRAND } from "@/lib/constants";
import { useMediaQuery } from "@/lib/useMediaQuery";

/**
 * S1 Hero (REVISI) — animasi lama (WebGL scene, crossfade pointer,
 * counter-zoom, entrance stagger) DIHAPUS total. Yang tersisa hanya:
 * 1. Soft reveal mengikuti kursor (tanpa bentuk lingkaran terlihat) —
 *    membuka foto garment putih, target ditarik ke titik tengah objek
 *    manusia (HeroReveal).
 * 2. Burung siluet CSS murni yang terbang ke atas saat scroll turun
 *    (HeroBirds).
 * Copy statis; h1 mix-blend-difference otomatis invert di atas area
 * yang ter-reveal putih. Touch/reduced-motion = poster statis bersih.
 */
type HeroSectionProps = {
  /** Headline display (SiteContent `hero.word`) — \n = ganti baris */
  word: string;
};

export function HeroSection({ word }: HeroSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const hoverCapable = useMediaQuery("(hover: hover)", true);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  return (
    <section
      ref={sectionRef}
      aria-label="Hero"
      className="relative flex h-svh min-h-[560px] flex-col justify-end overflow-hidden bg-surface-lowest"
    >
      {/* Foto dasar: garment hitam, statis full viewport */}
      <div className="absolute inset-0">
        <SafeImage
          src={ASSETS.hero.black}
          alt="Mosh Madness — garment hitam"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Soft reveal — buka garment putih mengikuti kursor (hover only) */}
      {hoverCapable && !reducedMotion && (
        <HeroReveal sectionRef={sectionRef} />
      )}

      {/* Scrim bawah supaya copy tetap kebaca di kedua garment */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-surface-lowest/80 to-transparent" />

      {/* Burung melayang — CSS murni, kabur ke atas saat scroll turun */}
      {!reducedMotion && <HeroBirds />}

      {/* Copy — statis tanpa animasi (revisi: animasi hero hanya blob + burung) */}
      <div className="pointer-events-none relative z-10 mx-auto w-full max-w-[1600px] px-4 pb-20 md:px-8">
        <p className="type-label mb-4 text-on-surface-variant">
          {BRAND.sku} / {BRAND.estCode} / BANJARMASIN
        </p>
        <h1 className="type-display-xl mix-blend-difference whitespace-pre-line text-primary">
          {word}
        </h1>
        <div className="mt-8 flex items-center justify-between">
          <p className="type-label max-w-[16rem] text-on-surface-variant">
            Streetwear premium dari mosh pit — {BRAND.name}, est.{" "}
            {BRAND.established}.
          </p>
          <span
            aria-hidden="true"
            className="type-label flex items-center gap-2 text-primary"
          >
            Scroll <ArrowDown size={14} />
          </span>
        </div>
      </div>
    </section>
  );
}
