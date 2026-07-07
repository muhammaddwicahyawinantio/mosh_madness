"use client";

import { memo } from "react";
import Link from "next/link";
import { motion, useTransform, type MotionValue } from "motion/react";
import { SafeImage } from "@/components/shared/SafeImage";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { formatRupiah } from "@/lib/utils";
import type { ProductDTO } from "@/types/api";

/**
 * Cylinder 3D — tiap face satu produk, tap/klik navigasi ke /product/[id].
 * Rotasi TIDAK lagi lewat drag/scroll-lock: di-drive langsung oleh
 * progress scroll section (scroll ke bawah → putar kanan, ke atas →
 * putar kiri). Murni CSS 3D transform + satu MotionValue → ringan &
 * jalan di mobile.
 */
const Cylinder = memo(function Cylinder({
  products,
  rotation,
}: {
  products: ProductDTO[];
  rotation: MotionValue<number>;
}) {
  const isScreenSm = useMediaQuery("(max-width: 640px)");
  // Desktop diperbesar (1800 → 2200): radius & lebar face naik → gambar
  // depan tampil lebih besar. Mobile (1100) dibiarkan — sudah pas.
  const cylinderWidth = isScreenSm ? 1100 : 2200;
  const faceCount = Math.max(products.length, 1);
  const faceWidth = cylinderWidth / faceCount;
  const radius = cylinderWidth / (2 * Math.PI);

  return (
    <div
      className="flex h-full items-center justify-center"
      style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
    >
      <motion.div
        className="relative flex h-full origin-center justify-center"
        style={{
          rotateY: rotation,
          width: cylinderWidth,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {products.map((product, i) => (
          <div
            key={product.id}
            className="absolute flex h-full origin-center items-center justify-center p-2"
            style={{
              width: `${faceWidth}px`,
              transform: `rotateY(${
                i * (360 / faceCount)
              }deg) translateZ(${radius}px)`,
              backfaceVisibility: "hidden",
            }}
          >
            <Link
              href={`/product/${product.id}`}
              draggable={false}
              className="group flex w-full flex-col"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden border border-outline-variant">
                <SafeImage
                  src={product.imageUrl}
                  alt={product.title}
                  fill
                  sizes="(max-width: 640px) 40vw, 360px"
                  draggable={false}
                  className="object-cover"
                />
              </div>
              {/* Title + harga selalu tampak (REFACTOR-03 card content) */}
              <span className="mt-3 flex flex-col gap-1">
                <span className="type-label text-primary group-hover:text-on-surface-variant">
                  {product.title}
                </span>
                <span className="type-price text-on-surface-variant">
                  {formatRupiah(product.price)}
                </span>
              </span>
            </Link>
          </div>
        ))}
      </motion.div>
    </div>
  );
});

/**
 * @param progress MotionValue 0→1 dari scroll section (useSectionProgress).
 *   Dipetakan ke rotasi cylinder. `null` → tampil statis (reduced-motion).
 */
export function ProductCarousel3D({
  products,
  progress,
}: {
  products: ProductDTO[];
  progress: MotionValue<number> | null;
}) {
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  // Reduced motion / tanpa progress → row statis, tetap bisa scroll & klik
  if (reducedMotion || !progress) {
    return (
      <div className="flex snap-x gap-px overflow-x-auto border border-outline-variant bg-outline-variant">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className="group relative aspect-[3/4] w-56 shrink-0 snap-start overflow-hidden bg-surface-lowest"
          >
            <SafeImage
              src={product.imageUrl}
              alt={product.title}
              fill
              sizes="224px"
              className="object-cover"
            />
            <span className="type-label absolute inset-x-0 bottom-0 bg-gradient-to-t from-surface-lowest/90 to-transparent p-3 pt-10 text-primary">
              {product.title} — {formatRupiah(product.price)}
            </span>
          </Link>
        ))}
      </div>
    );
  }

  return <RotatingCarousel products={products} progress={progress} />;
}

function RotatingCarousel({
  products,
  progress,
}: {
  products: ProductDTO[];
  progress: MotionValue<number>;
}) {
  // Satu putaran penuh melintasi pin section. Progress naik (scroll bawah)
  // → rotateY makin negatif = putar ke kanan; scroll atas membalik.
  const rotation = useTransform(progress, [0, 1], [0, -360]);

  return (
    <div className="relative h-[380px] w-full overflow-hidden sm:h-[520px] md:h-[640px]">
      <Cylinder products={products} rotation={rotation} />
    </div>
  );
}
