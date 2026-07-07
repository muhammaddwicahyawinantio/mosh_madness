/**
 * Konfigurasi brand & link — ganti placeholder di sini, bukan di komponen.
 */

export const BRAND = {
  name: "Mosh Madness",
  owner: "Ilham",
  location: "Banjarmasin, Kalimantan Selatan",
  established: "16 Mei 2024",
  /** Kode glyph simbolik untuk label teknis (DESIGN.md §1) */
  sku: "MSH-666",
  estCode: "EST. 16.05.24",
} as const;

export const SOCIAL = {
  /** TODO(Ilham): ganti nomor WA asli, format internasional tanpa + */
  whatsapp: "https://wa.me/6281234567890",
  /** TODO(Ilham): ganti username IG asli */
  instagram: "https://instagram.com/moshmadness",
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
  contactTemplate: "/assets/reference/contact-template.png",
  sponsor: {
    himati: "/assets/sponsor/logo_himati.png",
    polihasnur: "/assets/sponsor/logo_polihasnur.png",
    dwiscript: "/assets/sponsor/dwiscript.png",
  },
} as const;

/**
 * Foto dummy sementara (picsum, grayscale — sesuai imagery desaturated
 * DESIGN.md §9). TODO(Ilham): ganti dengan foto asli via /admin/media,
 * cukup update URL di sini.
 */
export const DUMMY_IMAGES = {
  contact: "https://picsum.photos/seed/mosh-contact/1000/1250?grayscale",
} as const;
