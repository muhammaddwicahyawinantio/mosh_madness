"use client";

import { memo, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useMotionValue,
} from "motion/react";
import { ArrowUpRight, X } from "lucide-react";
import { SafeImage } from "@/components/shared/SafeImage";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { duration, easeBrand, springFlick } from "@/lib/motion";
import { formatRupiah } from "@/lib/utils";
import type { ProductDTO } from "@/types/api";

/** Reveal blur transien untuk img carousel — durasi dari lib/motion */
const revealTransition = { duration: duration.fast, ease: easeBrand };

/**
 * Cylinder 3D draggable — tiap face satu produk. Diadaptasi ke sistem
 * desain Mosh Madness: radius 0, border 1px outline, token brand,
 * easing/spring dari lib/motion. Data dari props (API), bukan hardcode.
 */
const Cylinder = memo(function Cylinder({
  products,
  controls,
  onSelect,
  isActive,
}: {
  products: ProductDTO[];
  controls: ReturnType<typeof useAnimationControls>;
  onSelect: (product: ProductDTO) => void;
  isActive: boolean;
}) {
  const isScreenSm = useMediaQuery("(max-width: 640px)");
  const cylinderWidth = isScreenSm ? 1100 : 1800;
  const faceCount = Math.max(products.length, 1);
  const faceWidth = cylinderWidth / faceCount;
  const radius = cylinderWidth / (2 * Math.PI);
  const rotation = useMotionValue(0);

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
        drag={isActive ? "x" : false}
        className="relative flex h-full origin-center cursor-grab justify-center active:cursor-grabbing"
        style={{
          rotateY: rotation,
          width: cylinderWidth,
          transformStyle: "preserve-3d",
        }}
        onDrag={(_, info) =>
          isActive && rotation.set(rotation.get() + info.offset.x * 0.05)
        }
        onDragEnd={(_, info) =>
          isActive &&
          controls.start({
            rotateY: rotation.get() + info.velocity.x * 0.05,
            transition: springFlick,
          })
        }
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
            }}
            onClick={() => onSelect(product)}
          >
            <motion.img
              src={product.imageUrl}
              alt={product.title}
              layoutId={`carousel-${product.id}`}
              className="aspect-[3/4] w-full cursor-pointer border border-outline-variant object-cover"
              draggable={false}
              initial={{ filter: "blur(4px)" }}
              layout="position"
              animate={{ filter: "blur(0px)" }}
              transition={revealTransition}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
});

export function ProductCarousel3D({ products }: { products: ProductDTO[] }) {
  const [active, setActive] = useState<ProductDTO | null>(null);
  const [isActive, setIsActive] = useState(true);
  const controls = useAnimationControls();
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  // Reduced motion / animasi berat → row statis, tetap bisa scroll & klik
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

  const handleSelect = (product: ProductDTO) => {
    setActive(product);
    setIsActive(false);
    controls.stop();
  };

  const handleClose = () => {
    setActive(null);
    setIsActive(true);
  };

  return (
    <motion.div layout className="relative">
      <AnimatePresence mode="sync">
        {active && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: duration.base, ease: easeBrand }}
            onClick={handleClose}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-surface-lowest/85 p-6 md:p-16"
            style={{ willChange: "opacity" }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="grid max-h-full w-full max-w-4xl gap-px border border-outline-variant bg-outline-variant md:grid-cols-[1fr_320px]"
            >
              <div className="relative overflow-hidden bg-surface-lowest">
                <motion.img
                  layoutId={`carousel-${active.id}`}
                  src={active.imageUrl}
                  alt={active.title}
                  className="h-full max-h-[70vh] w-full object-cover"
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: duration.fast,
                  duration: duration.base,
                  ease: easeBrand,
                }}
                className="flex flex-col justify-between bg-surface-container p-6"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <p className="type-label text-accent-666">
                      Rilisan terbatas
                    </p>
                    <button
                      type="button"
                      onClick={handleClose}
                      aria-label="Tutup"
                      className="hover-invert -mr-2 -mt-2 p-2 text-on-surface-variant"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  <h3 className="type-headline-md mt-4 text-primary">
                    {active.title}
                  </h3>
                  {active.subtitle && (
                    <p className="type-label mt-2 text-on-surface-variant">
                      {active.subtitle}
                    </p>
                  )}
                  <p className="type-price mt-6 border-t border-outline-variant pt-4 text-primary">
                    {formatRupiah(active.price)}
                  </p>
                </div>

                <Link
                  href={`/product/${active.id}`}
                  className="type-label group mt-8 inline-flex items-center justify-center gap-2 border border-primary bg-primary px-6 py-3 text-on-primary hover:bg-transparent hover:text-primary"
                >
                  Lihat detail
                  <ArrowUpRight
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    style={{ transitionDuration: `${duration.fast}s` }}
                  />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative h-[420px] w-full overflow-hidden md:h-[500px]">
        <Cylinder
          products={products}
          controls={controls}
          onSelect={handleSelect}
          isActive={isActive}
        />
      </div>
    </motion.div>
  );
}
