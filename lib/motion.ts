/**
 * Konstanta animasi Mosh Madness — DESIGN.md §6.
 * DILARANG hardcode duration/easing di komponen. Import dari sini.
 */
import type { Variants } from "motion/react";

/* --------------------------------- Easing -------------------------------- */

/** Expo-out — entrance, reveal, expand */
export const easeBrand = [0.16, 1, 0.3, 1] as const;

/** Sharp in-out — inversi/switch state */
export const easeSharp = [0.83, 0, 0.17, 1] as const;

/* -------------------------------- Duration ------------------------------- */

export const duration = {
  /** Micro-interaction: focus ring, icon nudge */
  fast: 0.2,
  /** Reveal elemen tunggal */
  base: 0.5,
  /** Hero crossfade, parallax settle, selector expand */
  slow: 0.9,
} as const;

/** Jeda antar anak untuk stagger reveal */
export const stagger = 0.08;

/** Jeda antar karakter untuk SplitText — lebih rapat dari stagger anak */
export const staggerChar = 0.025;

/** Satu siklus loop marquee (detik) — linear, DESIGN.md §8 */
export const marqueeDuration = 15;

/** Lerp Lenis smooth scroll — DESIGN.md §6 */
export const lenisLerp = 0.1;

/** easeBrand sebagai string CSS — untuk transition non-Framer (flex expand dll) */
export const easeBrandCss = "cubic-bezier(0.16, 1, 0.3, 1)";

/** Spring lembut untuk pointer-follow (hero crossfade) */
export const springSoft = { stiffness: 120, damping: 30, mass: 1 } as const;

/** Flick spring — lempar carousel 3D produk, ringan & responsif ke velocity */
export const springFlick = {
  type: "spring",
  stiffness: 100,
  damping: 30,
  mass: 0.1,
} as const;

/** Ambient loop 3D sponsor — float idle (DESIGN.md §6 signature #3) */
export const ambientFloat = {
  /** rad/s kecepatan osilasi */
  speed: 0.6,
  /** amplitudo posisi Y (unit scene) */
  amplitude: 0.08,
  /** lerp per-frame untuk tilt mengejar pointer */
  tiltLerp: 0.08,
  /** tilt maksimum (radian) */
  tiltMax: 0.35,
} as const;

/** Konfigurasi boids hero — DESIGN.md §6 hard rules */
export const boidsConfig = {
  countDesktop: 60,
  countMobile: 25,
} as const;

/**
 * Shader hero (ambient loop + pointer-follow) — semua parameter gerak
 * WebGL hero terpusat di sini, bukan hardcode di shader/komponen.
 */
export const heroShader = {
  /** Kecepatan gelombang ripple (rad/s di uTime) */
  rippleSpeed: 2.4,
  /** Frekuensi spasial ripple */
  rippleFrequency: 22.0,
  /** Amplitudo distorsi UV ripple */
  rippleStrength: 0.012,
  /** Lerp per-frame posisi mouse di shader */
  mouseLerp: 0.075,
  /** Lerp per-frame progress crossfade */
  progressLerp: 0.06,
  /** Lebar feather transisi wipe hitam↔putih (UV) */
  wipeFeather: 0.22,
  /** Parallax UV mengikuti mouse */
  mouseParallax: 0.012,
} as const;

/* ----------------------------- Shared variants ---------------------------- */

/** Reveal standar: translate-y 24px + fade, sekali saja (once: true di viewport) */
export const revealUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: duration.base, ease: easeBrand },
  },
};

/** Container untuk stagger anak-anak revealUp */
export const revealStagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: stagger } },
};

/** Clip-path wipe dari bawah — untuk imagery/headline besar */
export const wipeUp: Variants = {
  hidden: { clipPath: "inset(100% 0% 0% 0%)" },
  visible: {
    clipPath: "inset(0% 0% 0% 0%)",
    transition: { duration: duration.slow, ease: easeBrand },
  },
};

/** Viewport config standar untuk whileInView */
export const viewportOnce = { once: true, amount: 0.3 } as const;

/** Entrance zoom section — konten masuk dengan scale + lift (ala Lusion/oryzo) */
export const zoomIn: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: duration.slow, ease: easeBrand },
  },
};

/**
 * Sticky stack (home): panel yang tertimpa section berikutnya
 * menyusut + meredup — scroll-linked, bukan tween.
 */
export const stackShrink = {
  /** Scale akhir panel saat tertutup penuh */
  scale: 0.94,
  /** Opacity overlay gelap saat tertutup penuh */
  dim: 0.55,
} as const;

/** Counter-zoom imagery scroll-linked (About, detail produk, dst) */
export const imageZoom = { from: 1, to: 1.15 } as const;
