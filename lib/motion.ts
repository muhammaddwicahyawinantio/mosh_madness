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

/**
 * Spring fisik — damped harmonic oscillator, integrasi manual per frame
 * (lib/webgl.ts springStep). Dipakai blob reveal hero: gerak berbobot
 * dengan inersia, bukan lerp linear.
 */
export const spring3D = {
  /** Konstanta pegas (1/s²) */
  stiffness: 46,
  /** Redaman (1/s) — sedikit underdamped supaya terasa ada massa */
  damping: 10.5,
} as const;

/**
 * Hero soft reveal (REVISI 2) — TANPA bentuk blob/lingkaran terlihat:
 * mask radial-gradient dengan feather lebar, jadi "cahaya" lembut yang
 * membuka foto garment putih di bawah foto hitam, mengikuti kursor
 * dengan lag berbobot dan ditarik ke titik tengah objek manusia.
 */
export const heroReveal = {
  /** Titik tengah objek manusia di foto (fraksi 0..1 dari section) */
  center: { x: 0.5, y: 0.48 },
  /** Seberapa kuat target reveal ditarik ke titik tengah (0..1) */
  centerBias: 0.22,
  /** Radius area reveal (fraksi sisi terpendek viewport) — feather
      lebar butuh radius besar supaya area solidnya tetap terasa */
  radius: 0.34,
  /** Posisi stop gradasi masih solid (%) — sisanya feather ke transparan;
      makin kecil makin lembut (tidak ada tepi bulat kelihatan) */
  featherStart: 25,
  /** Lerp per-frame radius tumbuh/kolaps saat pointer masuk/keluar */
  radiusLerp: 0.1,
} as const;

/**
 * Burung hero (REVISI hero) — siluet CSS/Tailwind murni (tanpa canvas):
 * melayang horizontal dengan kepak + bob, lalu terbang ke atas layar
 * bersamaan saat user scroll ke bawah.
 */
export const heroBirds = {
  countDesktop: 26,
  countMobile: 13,
  /** Rentang lebar siluet (px) — lebih besar dari versi boids lama */
  sizeMin: 22,
  sizeMax: 40,
  /** Rentang durasi satu lintasan horizontal (detik) */
  driftMin: 26,
  driftMax: 48,
  /** Durasi satu kepak sayap (detik) */
  flap: 0.9,
  /** Durasi bob vertikal idle (detik) */
  bob: 5.5,
  /** Terbang ke atas saat scroll turun: durasi & stagger maksimum (detik) */
  flyUpDuration: 1.4,
  flyUpStaggerMax: 0.35,
  /** Ambang scrollY (px) yang memicu kabur ke atas */
  scrollThreshold: 24,
} as const;

/**
 * Slide galeri detail produk (REFACTOR-05) — manual & direction-aware:
 * next masuk dari kanan, prev dari kiri; teks menyusul imagery sedikit
 * untuk depth. TANPA autoplay.
 */
export const gallerySlide = {
  /** Offset X imagery masuk/keluar (persen lebar frame) */
  imageOffsetPct: 60,
  /** Offset X blok teks (px) — lebih kecil dari imagery, kesan lapisan */
  textOffsetPx: 48,
  /** Delay teks menyusul imagery (detik) */
  textDelay: 0.08,
  /** Ambang jarak drag horizontal untuk ganti slide (px) */
  swipeThreshold: 60,
  /** Ambang kecepatan drag (px/s) */
  swipeVelocity: 400,
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
