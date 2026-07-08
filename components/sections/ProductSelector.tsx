"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import useSWR from "swr";
import { motion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { ProductCarousel3D } from "@/components/sections/ProductCarousel3D";
import { SplitText } from "@/components/shared/SplitText";
import { ASSETS, BRAND } from "@/lib/constants";
import { jsonFetcher } from "@/lib/fetcher";
import { duration, revealStagger, revealUp, viewportOnce } from "@/lib/motion";
import { useSectionProgress } from "@/lib/hooks/useSectionProgress";
import { useMediaQuery } from "@/lib/useMediaQuery";
import type { ProductDTO } from "@/types/api";

/** Polling realtime Section 3 — keputusan final: SWR ~15s + revalidate on focus */
const REFRESH_MS = 15_000;

/**
 * S3 Product Selector — cylinder 3D yang berputar mengikuti scroll
 * (scroll bawah → kanan, atas → kiri). Section di-pin (sticky) selama
 * satu putaran; rotasi di-drive useSectionProgress (Lenis + fallback
 * native) → jalan di desktop & mobile, TANPA drag/lock. Data live dari
 * /api/products?home=true; toggle admin kelihatan tanpa reload.
 */
export function ProductSelector() {
  const { data, error, isLoading } = useSWR<ProductDTO[]>(
    "/api/products?home=true",
    jsonFetcher,
    { refreshInterval: REFRESH_MS, revalidateOnFocus: true },
  );

  const products = data ?? [];
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const sectionRef = useRef<HTMLElement>(null);
  // Pin + rotasi hanya kalau ada ≥2 produk dan bukan reduced-motion
  const animate = !reducedMotion && products.length >= 2;
  const progress = useSectionProgress(sectionRef, animate);

  const header = (
    <motion.div
      variants={revealStagger}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      className="mb-12 flex flex-wrap items-end justify-between gap-6"
    >
      <div>
        <motion.p variants={revealUp} className="type-meta mb-6 text-accent-666">
          002 / Bestseller
        </motion.p>
        <h2 className="type-headline-lg type-metal text-primary">
          <SplitText text="Clothing Brand" />
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
  );

  // ---------- Loading / error / kosong: layout normal tanpa pin ----------
  if (isLoading || error || products.length === 0) {
    return (
      <section
        ref={sectionRef}
        id="bestseller"
        aria-label="Produk unggulan"
        className="relative mx-auto max-w-[1600px] px-4 py-32 md:px-8"
      >
        {header}
        {isLoading ? (
          <div
            aria-hidden="true"
            className="bg-blueprint h-[420px] animate-pulse border border-outline-variant md:h-[500px]"
          />
        ) : error ? (
          <div className="bg-blueprint flex h-64 items-center justify-center border border-outline-variant">
            <p className="type-label text-error">Gagal memuat produk — coba refresh</p>
          </div>
        ) : (
          <div className="bg-blueprint flex h-64 items-center justify-center border border-outline-variant">
            <p className="type-label text-on-surface-variant">
              Belum ada produk di etalase — segera
            </p>
          </div>
        )}
      </section>
    );
  }

  // ---------- Reduced motion: statis, tanpa pin ----------
  if (!animate) {
    return (
      <section
        ref={sectionRef}
        id="bestseller"
        aria-label="Produk unggulan"
        className="relative mx-auto max-w-[1600px] px-4 py-32 md:px-8"
      >
        {header}
        <ProductCarousel3D products={products} progress={null} />
      </section>
    );
  }

  // ---------- Desktop & mobile: pin + rotasi scroll-linked ----------
  return (
    <section
      ref={sectionRef}
      id="bestseller"
      aria-label="Produk unggulan"
      className="relative h-[250vh] bg-surface"
    >
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden px-4 py-16 md:px-8">
        <ProductBackdrop />
        <div className="relative z-10 mx-auto w-full max-w-[1600px]">
          <span
            aria-hidden="true"
            className="type-label text-vertical absolute left-2 top-24 hidden text-outline lg:block"
          >
            Bestseller / {BRAND.sku}
          </span>
          {header}
          <ProductCarousel3D products={products} progress={progress} />
          <p className="type-label mt-6 text-center text-outline">
            Scroll untuk memutar — tap untuk lihat detail
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Background section product — `product-section.png` di belakang konten
 * (z-0, konten z-10). Opacity rendah + mix-blend biar carousel & teks tetap
 * kebaca; pointer-events off supaya tidak ganggu hover/tap card. Ikut pola
 * background editorial section About.
 */
function ProductBackdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <Image
        src={ASSETS.product}
        alt=""
        fill
        sizes="100vw"
        className="object-cover opacity-40 mix-blend-luminosity"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-surface via-surface/70 to-surface" />
    </div>
  );
}
