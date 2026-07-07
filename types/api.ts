/** Bentuk data yang dikirim API ke client — JANGAN expose field internal. */

// ---------- Public ----------

/** Kartu produk publik — imageUrl = image primary produk. */
export interface ProductDTO {
  id: string;
  slug: string;
  /** Product.name */
  title: string;
  /** Product.description (satu baris pendek) */
  subtitle: string | null;
  /** Rupiah, integer */
  price: number;
  /** Harga coret (diskon), null = tanpa diskon */
  compareAt: number | null;
  imageUrl: string;
}

export interface ProductImageDTO {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  sort: number;
}

/** GET /api/products/[slug] — detail + semua varian foto. */
export interface ProductDetailDTO extends ProductDTO {
  category: string | null;
  images: ProductImageDTO[];
}

export interface HeroMediaDTO {
  id: string;
  variant: "BLACK" | "WHITE";
  url: string;
  alt: string;
}

export interface SponsorDTO {
  id: string;
  name: string;
  logoUrl: string;
  link: string | null;
}

/** GET /api/content?keys=… → { "hero.word": "…" } */
export type SiteContentMap = Record<string, string>;

// ---------- Admin ----------

export interface MediaAssetDTO {
  id: string;
  url: string;
  alt: string;
  mime: string;
  width: number | null;
  height: number | null;
  size: number;
  createdAt: string;
}

export interface AdminProductImageDTO extends ProductImageDTO {
  mediaId: string;
}

export interface AdminProductDTO {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAt: number | null;
  category: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  showInHome: boolean;
  showInParallax: boolean;
  images: AdminProductImageDTO[];
}

export interface AdminHeroDTO {
  id: string;
  variant: "BLACK" | "WHITE";
  mediaId: string;
  url: string;
  alt: string;
  sort: number;
  active: boolean;
}

export interface AdminSponsorDTO {
  id: string;
  name: string;
  mediaId: string;
  logoUrl: string;
  link: string | null;
  sort: number;
  active: boolean;
}

export interface ContactMessageDTO {
  id: string;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  handled: boolean;
  createdAt: string;
}

export interface SiteContentDTO {
  key: string;
  value: string;
  updatedAt: string;
}

// ---------- Analytics (pertahankan) ----------

export interface AnalyticsPoint {
  /** YYYY-MM-DD */
  date: string;
  views: number;
  visitors: number;
}

export interface AnalyticsSummary {
  totalViews: number;
  totalVisitors: number;
  viewsToday: number;
  series: AnalyticsPoint[];
}

export interface ApiError {
  error: string;
}
