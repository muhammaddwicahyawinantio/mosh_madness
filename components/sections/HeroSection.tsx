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
import { ArrowDown } from "lucide-react";
import { SafeImage } from "@/components/shared/SafeImage";
import { SplitText } from "@/components/shared/SplitText";
import { ParticleCanvas } from "@/components/sections/ParticleCanvas";
import { useStackProgress } from "@/components/shared/StackPanel";
import { ASSETS, BRAND } from "@/lib/constants";
import { useMediaQuery } from "@/lib/useMediaQuery";
import {
  duration,
  easeBrand,
  imageZoom,
  revealStagger,
  revealUp,
} from "@/lib/motion";

// three hanya dimuat client-side — poster image tampil duluan
const HeroScene = dynamic(() => import("./HeroScene"), { ssr: false });

/**
 * S1 Hero — signature moment #1, versi WebGL:
 * crossfade garment hitam↔putih di fragment shader (soft wipe ikut
 * pointer + ripple radial), headline SplitText per karakter,
 * particle boids di atasnya.
 */
export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const hoverCapable = useMediaQuery("(hover: hover)", true);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const inView = useInView(sectionRef, { margin: "100px 0px" });

  // Target crossfade + posisi mouse (0..1) — smoothing terjadi di shader
  const pointerProgress = useMotionValue(0);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  // Hero di-pin StackPanel dari scroll 0 → pakai progress "ditimpa"
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const stackProgress = useStackProgress();
  const coverProgress = stackProgress ?? scrollYProgress;

  // Touch: crossfade digerakkan scroll; hover: digerakkan pointer
  const crossfadeSource = hoverCapable ? pointerProgress : coverProgress;

  // Counter-zoom imagery saat hero ditimpa — depth ala Lusion
  const bgScale = useTransform(
    coverProgress,
    [0, 1],
    [imageZoom.from, imageZoom.to],
  );

  return (
    <section
      ref={sectionRef}
      aria-label="Hero"
      className="relative flex h-svh min-h-[560px] flex-col justify-end overflow-hidden bg-surface-lowest"
      onPointerMove={(e) => {
        if (!hoverCapable) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        pointerProgress.set(x);
        mouseX.set(x);
        mouseY.set(y);
      }}
      onPointerLeave={() => {
        pointerProgress.set(0);
        mouseX.set(0.5);
        mouseY.set(0.5);
      }}
    >
      {/* Layer imagery: poster statis di bawah, shader WebGL di atas */}
      <motion.div className="absolute inset-0" style={{ scale: bgScale }}>
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: duration.slow * 1.6, ease: easeBrand }}
        >
          <SafeImage
            src={ASSETS.hero.black}
            alt="Mosh Madness — garment hitam"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {!reducedMotion && (
            <HeroScene
              progress={crossfadeSource}
              mouseX={mouseX}
              mouseY={mouseY}
              active={inView}
            />
          )}
        </motion.div>
        {/* Scrim bawah supaya teks tetap kebaca di kedua garment */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-surface-lowest/80 to-transparent" />
      </motion.div>

      {/* Boids "burung terbang" */}
      <ParticleCanvas className="pointer-events-none absolute inset-0 h-full w-full" />

      {/* Copy */}
      <motion.div
        variants={revealStagger}
        initial="hidden"
        animate="visible"
        className="pointer-events-none relative z-10 mx-auto w-full max-w-[1600px] px-4 pb-20 md:px-8"
      >
        <motion.p
          variants={revealUp}
          className="type-label mb-4 text-on-surface-variant"
        >
          {BRAND.sku} / {BRAND.estCode} / BANJARMASIN
        </motion.p>
        <h1 className="type-display-xl mix-blend-difference text-primary">
          <SplitText text="Kegelapan" onView={false} delay={0.15} />
          <br />
          <SplitText text="sebagai bentuk seni" onView={false} delay={0.4} />
        </h1>
        <motion.div
          variants={revealUp}
          className="mt-8 flex items-center justify-between"
        >
          <p className="type-label max-w-[16rem] text-on-surface-variant">
            Streetwear premium dari mosh pit — {BRAND.name}, est.{" "}
            {BRAND.established}.
          </p>
          <motion.span
            aria-hidden="true"
            className="type-label flex items-center gap-2 text-primary"
            animate={{ y: [0, 6, 0] }}
            transition={{
              duration: duration.slow * 2,
              ease: easeBrand,
              repeat: Infinity,
            }}
          >
            Scroll <ArrowDown size={14} />
          </motion.span>
        </motion.div>
      </motion.div>
    </section>
  );
}
