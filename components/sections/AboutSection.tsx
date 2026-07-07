"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useTransform,
} from "motion/react";
import Image from "next/image";
import { SplitText } from "@/components/shared/SplitText";
import { Typewriter } from "@/components/ui/typewriter-text";
import { ASSETS, BRAND } from "@/lib/constants";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { useWebGLSupport } from "@/lib/webgl";
import {
  imageZoom,
  revealStagger,
  revealUp,
  viewportOnce,
} from "@/lib/motion";

// three hanya dimuat client-side saat section mendekati viewport —
// tidak pernah memblokir LCP (REFACTOR-02)
const AboutScene = dynamic(() => import("./AboutScene"), { ssr: false });

/**
 * S2 About — signature moment #2: foto about-section.png sebagai
 * background full-bleed dengan deep parallax zoom scroll-linked
 * (scale 1 → 1.15) + displacement shader halus (REFACTOR-02) + scrim
 * gelap; teks manifesto dengan typewriter di label dokumen.
 */
export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const webglOk = useWebGLSupport();
  // Mount canvas sekali saat section mendekat, lalu biarkan terpasang;
  // frameloop-nya yang dimatikan saat off-view
  const hasEntered = useInView(sectionRef, {
    once: true,
    margin: "25% 0px",
  });
  const inView = useInView(sectionRef, { margin: "100px 0px" });

  // Posisi pointer relatif section (0..1) — smoothing terjadi di shader
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const bgScale = useTransform(
    scrollYProgress,
    [0, 1],
    [imageZoom.from, imageZoom.to],
  );
  // Background bergerak lebih lambat dari konten — depth parallax
  const bgY = useTransform(scrollYProgress, [0, 1], ["-4%", "4%"]);

  const showScene = hasEntered && !reducedMotion && webglOk;

  return (
    <section
      ref={sectionRef}
      id="about"
      aria-label="Tentang Mosh Madness"
      className="relative overflow-hidden"
      onPointerMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set((e.clientX - rect.left) / rect.width);
        mouseY.set((e.clientY - rect.top) / rect.height);
      }}
    >
      {/* Background full-bleed + parallax zoom */}
      <motion.div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ scale: bgScale, y: bgY }}
      >
        <Image
          src={ASSETS.about}
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        {/* Displacement layer — foto statis di bawah tetap jadi fallback */}
        {showScene && (
          <AboutScene mouseX={mouseX} mouseY={mouseY} active={inView} />
        )}
      </motion.div>
      {/* Scrim — teks tetap kebaca, foto tetap hidup */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-r from-surface-lowest/90 via-surface-lowest/70 to-surface-lowest/30"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-surface-lowest/80 to-transparent"
      />

      {/* Vertical label desktop (DESIGN.md §4) */}
      <span
        aria-hidden="true"
        className="type-label text-vertical absolute left-2 top-32 z-10 hidden text-outline lg:block"
      >
        Tentang / {BRAND.estCode}
      </span>

      {/* Copy — dipertahankan, sekarang di atas foto */}
      <div className="relative z-10 mx-auto max-w-[1600px] px-4 py-40 md:px-8 lg:py-48">
        <motion.div
          variants={revealStagger}
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          className="max-w-2xl lg:ml-[8.333%]"
        >
          <p className="type-label mb-6 text-accent-666">
            <Typewriter text="001 / Manifesto" />
          </p>
          <h2 className="type-headline-lg text-primary">
            <SplitText text="Lahir dari" />
            <br />
            <SplitText text="mosh pit" delay={0.2} />
          </h2>
          <motion.div
            variants={revealUp}
            className="type-body-lg mt-8 flex flex-col gap-5 text-on-surface"
          >
            <p>
              {BRAND.name} berdiri {BRAND.established} di {BRAND.location} —
              dibangun {BRAND.owner} dari keringat barisan depan panggung.
              Bukan sekadar pakaian: ini seragam untuk mereka yang menolak
              jinak.
            </p>
            <p>
              Angka <span className="text-accent-666">666</span> di label kami
              bukan provokasi murahan. Ia simbol perlawanan — anti-polish,
              anti-seragam, energi mentah yang tidak minta izin. Kegelapan kami
              rawat sebagai bentuk seni.
            </p>
          </motion.div>
          <p className="type-label mt-10 text-on-surface-variant">
            <Typewriter
              text={`${BRAND.sku} — Banjarmasin, Kalimantan Selatan`}
              delay={0.4}
            />
          </p>
        </motion.div>

        <span className="type-label absolute bottom-6 right-4 z-10 bg-surface-lowest/80 px-2 py-1 text-on-surface-variant md:right-8">
          Doc. 001 — {BRAND.estCode}
        </span>
      </div>
    </section>
  );
}
