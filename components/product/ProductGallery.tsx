"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  type PanInfo,
  type Variants,
} from "motion/react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SafeImage } from "@/components/shared/SafeImage";
import { ProductInfo } from "@/components/product/ProductInfo";
import { BRAND } from "@/lib/constants";
import { duration, easeBrand, gallerySlide } from "@/lib/motion";
import type { ProductDTO } from "@/types/api";

/** Imagery slide penuh — arah mengikuti tombol/gesture (REFACTOR-05) */
const imageVariants: Variants = {
  enter: (dir: number) => ({
    x: `${dir * gallerySlide.imageOffsetPct}%`,
    opacity: 0,
  }),
  center: {
    x: "0%",
    opacity: 1,
    transition: { duration: duration.slow * 0.7, ease: easeBrand },
  },
  exit: (dir: number) => ({
    x: `${-dir * gallerySlide.imageOffsetPct}%`,
    opacity: 0,
    transition: { duration: duration.base, ease: easeBrand },
  }),
};

/**
 * Galeri detail produk (REFACTOR-05) — transisi manual antar produk:
 * panah, keyboard (←/→), dan swipe horizontal. TANPA autoplay.
 * Imagery + title + subtitle + harga bergerak sebagai satu unit
 * direction-aware; URL di-sync via history.replaceState (shallow)
 * supaya tiap slide tetap bisa di-share/refresh.
 */
export function ProductGallery({
  products,
  initialId,
}: {
  products: ProductDTO[];
  initialId: string;
}) {
  const initialIndex = Math.max(
    0,
    products.findIndex((p) => p.id === initialId),
  );
  const [[index, direction], setSlide] = useState<[number, number]>([
    initialIndex,
    0,
  ]);

  const count = products.length;
  const product = products[index] ?? products[0];

  const paginate = useCallback(
    (dir: number) => {
      if (count < 2) return;
      setSlide(([current]) => [(current + dir + count) % count, dir]);
    },
    [count],
  );

  // Keyboard ←/→ (aksesibilitas — REFACTOR-05)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") paginate(1);
      if (e.key === "ArrowLeft") paginate(-1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [paginate]);

  // Shallow URL sync — slide bisa di-refresh/share tanpa full navigation
  useEffect(() => {
    if (!product) return;
    window.history.replaceState(
      window.history.state,
      "",
      `/product/${product.id}`,
    );
  }, [product]);

  // Swipe horizontal → slide; drag vertikal tetap scroll halaman
  // (drag "x" + touchAction pan-y)
  const onDragEnd = (_: unknown, info: PanInfo) => {
    const { offset, velocity } = info;
    if (
      offset.x < -gallerySlide.swipeThreshold ||
      velocity.x < -gallerySlide.swipeVelocity
    ) {
      paginate(1);
    } else if (
      offset.x > gallerySlide.swipeThreshold ||
      velocity.x > gallerySlide.swipeVelocity
    ) {
      paginate(-1);
    }
  };

  if (!product) return null;

  return (
    <div className="mx-auto grid max-w-[1600px] gap-12 px-4 pb-32 pt-28 md:px-8 lg:grid-cols-12 lg:gap-8">
      {/* Imagery frame — slide direction-aware di dalamnya */}
      <div
        className="relative aspect-[3/4] overflow-hidden border border-outline-variant lg:col-span-6"
        style={{ touchAction: "pan-y" }}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={product.id}
            custom={direction}
            variants={imageVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag={count > 1 ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragEnd={onDragEnd}
            className="absolute inset-0"
          >
            <SafeImage
              src={product.imageUrl}
              alt={product.title}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              draggable={false}
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        <span className="type-label pointer-events-none absolute bottom-3 left-3 bg-surface-lowest px-2 py-1 text-on-surface-variant">
          {BRAND.sku} / {BRAND.estCode}
        </span>

        {count > 1 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-px border border-outline-variant bg-outline-variant">
            <button
              type="button"
              aria-label="Produk sebelumnya"
              onClick={() => paginate(-1)}
              className="hover-invert bg-surface-lowest p-3 text-on-surface"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              type="button"
              aria-label="Produk berikutnya"
              onClick={() => paginate(1)}
              className="hover-invert bg-surface-lowest p-3 text-on-surface"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Info — bagian produk ikut slide, chrome halaman tetap diam */}
      <div className="flex flex-col justify-center lg:col-span-5 lg:col-start-8">
        <div>
          <Link
            href="/product"
            className="type-label hover-invert -mx-2 inline-flex items-center gap-2 px-2 py-1 text-on-surface-variant"
          >
            <ArrowLeft size={12} /> Kembali ke katalog
          </Link>
        </div>

        {count > 1 && (
          <p className="type-label mt-10 text-outline">
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(count).padStart(2, "0")}
          </p>
        )}

        <div className="relative mt-4 overflow-x-clip">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <ProductInfo
              key={product.id}
              product={product}
              direction={direction}
            />
          </AnimatePresence>
        </div>

        <dl className="type-label mt-12 grid grid-cols-2 gap-y-3 border-t border-outline-variant pt-6 text-on-surface-variant">
          <dt className="text-outline">Brand</dt>
          <dd>{BRAND.name}</dd>
          <dt className="text-outline">Origin</dt>
          <dd>{BRAND.location}</dd>
          <dt className="text-outline">Est.</dt>
          <dd>{BRAND.established}</dd>
        </dl>
      </div>
    </div>
  );
}
