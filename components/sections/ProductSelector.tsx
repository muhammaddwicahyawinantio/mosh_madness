"use client";

import Link from "next/link";
import useSWR from "swr";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { ProductCarousel3D } from "@/components/sections/ProductCarousel3D";
import { SplitText } from "@/components/shared/SplitText";
import { BRAND } from "@/lib/constants";
import { jsonFetcher } from "@/lib/fetcher";
import { duration, revealStagger, revealUp, viewportOnce } from "@/lib/motion";
import type { ProductDTO } from "@/types/api";

/** Polling realtime Section 3 — keputusan final: SWR ~15s + revalidate on focus */
const REFRESH_MS = 15_000;

/**
 * S3 Product Selector — cylinder 3D draggable (ProductCarousel3D).
 * Data live dari /api/products?home=true; toggle "showOnHome" admin
 * kelihatan di sini tanpa reload.
 */
export function ProductSelector() {
  const { data, error, isLoading } = useSWR<ProductDTO[]>(
    "/api/products?home=true",
    jsonFetcher,
    { refreshInterval: REFRESH_MS, revalidateOnFocus: true },
  );

  const products = data ?? [];

  return (
    <section
      id="bestseller"
      aria-label="Produk unggulan"
      className="relative mx-auto max-w-[1600px] px-4 py-32 md:px-8"
    >
      <span
        aria-hidden="true"
        className="type-label text-vertical absolute left-2 top-32 hidden text-outline lg:block"
      >
        Bestseller / {BRAND.sku}
      </span>

      {/* Header */}
      <motion.div
        variants={revealStagger}
        initial="hidden"
        whileInView="visible"
        viewport={viewportOnce}
        className="mb-12 flex flex-wrap items-end justify-between gap-6"
      >
        <div>
          <motion.p variants={revealUp} className="type-label mb-6 text-accent-666">
            002 / Bestseller
          </motion.p>
          <h2 className="type-headline-lg text-primary">
            <SplitText text="Pilihan barisan depan" />
          </h2>
        </div>
        <motion.div variants={revealUp}>
          <Link
            href="/product"
            className="type-label group inline-flex items-center gap-2 border border-primary bg-primary px-6 py-3 text-on-primary hover:bg-transparent hover:text-primary"
          >
            Lihat semua
            <ArrowUpRight
              size={14}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              style={{ transitionDuration: `${duration.fast}s` }}
            />
          </Link>
        </motion.div>
      </motion.div>

      {/* Carousel 3D */}
      {isLoading ? (
        <div
          aria-hidden="true"
          className="bg-blueprint h-[420px] animate-pulse border border-outline-variant md:h-[500px]"
        />
      ) : error ? (
        <div className="bg-blueprint flex h-64 items-center justify-center border border-outline-variant">
          <p className="type-label text-error">Gagal memuat produk — coba refresh</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-blueprint flex h-64 items-center justify-center border border-outline-variant">
          <p className="type-label text-on-surface-variant">
            Belum ada produk di etalase — segera
          </p>
        </div>
      ) : (
        <>
          <ProductCarousel3D products={products} />
          <p className="type-label mt-6 text-center text-outline">
            Seret untuk memutar — klik untuk lihat detail
          </p>
        </>
      )}
    </section>
  );
}
