import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format harga ke Rupiah tanpa desimal — "Rp 250.000" */
export function formatRupiah(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Logo mitra gelap-monokrom (siluet hitam/navy) → dijadikan siluet putih
 * lewat filter, biar kebaca di background gelap TANPA perlu kartu/kotak
 * ("bebas no background"). Logo berwarna (mis. emblem HIMATI) dibiarkan
 * apa adanya. Heuristik dari nama file aset statis; default (upload admin
 * yang tak dikenal) = tidak diubah, tampil apa adanya.
 */
const DARK_LOGO_HINTS = ["dwiscript", "polihasnur"];
export function logoNeedsWhiten(url: string): boolean {
  return DARK_LOGO_HINTS.some((hint) => url.includes(hint));
}

/** "Spøkelse Guardians!" → "spokelse-guardians" */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ø/g, "o") // ø tidak terurai lewat NFKD
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
