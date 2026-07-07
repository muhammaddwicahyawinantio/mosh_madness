/**
 * Konfigurasi brand & link — ganti placeholder di sini, bukan di komponen.
 */

export const BRAND = {
  name: "Mosh Madness",
  owner: "Ilham",
  location: "Banjarmasin, Kalimantan Selatan",
  established: "17 Maret 2024",
  /** Kode glyph simbolik untuk label teknis (DESIGN.md §1) */
  sku: "MSH-666",
  estCode: "EST. 17.03.24",
} as const;

export const SOCIAL = {
  /** TODO(Ilham): ganti nomor WA asli, format internasional tanpa + */
  whatsapp: "https://wa.me/6288245268848",
  /** TODO(Ilham): ganti username IG asli */
  instagram: "https://instagram.com/mosh_madness",
} as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Product", href: "/product" },
  { label: "Contact", href: "/contact" },
] as const;

/**
 * Path asset statis. Semua komponen WAJIB akses via konstanta ini
 * dan render fallback (lihat components/shared/SafeImage) kalau file belum ada.
 */
export const ASSETS = {
  hero: {
    black: "/assets/hero/hero-black.jpeg",
    white: "/assets/hero/hero-white.jpeg",
  },
  about: "/assets/about/about-section.png",
  sponsor: {
    himati: "/assets/sponsor/logo_himati.png",
    polihasnur: "/assets/sponsor/logo_polihasnur.png",
    dwiscript: "/assets/sponsor/dwiscript.png",
  },
} as const;

