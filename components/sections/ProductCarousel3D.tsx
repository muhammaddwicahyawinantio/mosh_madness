"use client";

import { memo, useCallback, useRef } from "react";
import Link from "next/link";
import {
  motion,
  useAnimationControls,
  useMotionValue,
  type MotionValue,
} from "motion/react";
import { SafeImage } from "@/components/shared/SafeImage";
import { useScrollLockedCarousel } from "@/lib/hooks/useScrollLockedCarousel";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { duration, easeBrand, springFlick } from "@/lib/motion";
import { formatRupiah } from "@/lib/utils";
import type { ProductDTO } from "@/types/api";

/** Reveal blur transien untuk img carousel — durasi dari lib/motion */
const revealTransition = { duration: duration.fast, ease: easeBrand };

/**
 * Cylinder 3D — tiap face satu produk, klik/tap navigasi ke
 * /product/[id] (REFACTOR-03: TANPA lightbox/preview). Title + harga
 * selalu terlihat di bawah imagery, bukan on-hover.
 */
const Cylinder = memo(function Cylinder({
  products,
  controls,
  rotation,
}: {
  products: ProductDTO[];
  controls: ReturnType<typeof useAnimationControls>;
  rotation: MotionValue<number>;
}) {
  const isScreenSm = useMediaQuery("(max-width: 640px)");
  const cylinderWidth = isScreenSm ? 1100 : 1800;
  const faceCount = Math.max(products.length, 1);
  const faceWidth = cylinderWidth / faceCount;
  const radius = cylinderWidth / (2 * Math.PI);
  // Guard klik-vs-drag: drag baru saja selesai = jangan navigasi
  const draggingRef = useRef(false);

  return (
    <div
      className="flex h-full items-center justify-center"
      style={{
        perspective: "1000px",
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      <motion.div
        drag="x"
        dragMomentum={false}
        className="relative flex h-full origin-center cursor-grab justify-center active:cursor-grabbing"
        style={{
          rotateY: rotation,
          width: cylinderWidth,
          transformStyle: "preserve-3d",
        }}
        onDragStart={() => {
          draggingRef.current = true;
        }}
        onDrag={(_, info) => rotation.set(rotation.get() + info.delta.x * 0.05)}
        onDragEnd={(_, info) => {
          controls.start({
            rotateY: rotation.get() + info.velocity.x * 0.05,
            transition: springFlick,
          });
          // click event datang SETELAH dragend — reset di frame berikutnya
          window.setTimeout(() => {
            draggingRef.current = false;
          }, 0);
        }}
        animate={controls}
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
              onClick={(e) => {
                if (draggingRef.current) e.preventDefault();
              }}
              className="group flex w-full flex-col"
            >
              <motion.div
                className="relative aspect-[3/4] w-full overflow-hidden border border-outline-variant"
                initial={{ filter: "blur(4px)" }}
                animate={{ filter: "blur(0px)" }}
                transition={revealTransition}
              >
                <SafeImage
                  src={product.imageUrl}
                  alt={product.title}
                  fill
                  sizes="(max-width: 640px) 40vw, 300px"
                  draggable={false}
                  className="object-cover"
                />
              </motion.div>
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

export function ProductCarousel3D({ products }: { products: ProductDTO[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const controls = useAnimationControls();
  const rotation = useMotionValue(0);
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  // Scroll-lock hanya desktop (keputusan final REFACTOR-03):
  // pointer halus + hover — touch device pakai drag/swipe biasa
  const isDesktop = useMediaQuery("(hover: hover) and (pointer: fine)");

  const stopFlick = useCallback(() => controls.stop(), [controls]);

  useScrollLockedCarousel({
    targetRef: wrapperRef,
    rotation,
    faceCount: products.length,
    enabled: isDesktop && !reducedMotion,
    onEngage: stopFlick,
  });

  // Reduced motion → row statis, tetap bisa scroll & klik
  if (reducedMotion) {
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

  return (
    <div
      ref={wrapperRef}
      className="relative h-[480px] w-full overflow-hidden md:h-[560px]"
    >
      <Cylinder products={products} controls={controls} rotation={rotation} />
    </div>
  );
}
