"use client";

import { motion, type Variants } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { BRAND, SOCIAL } from "@/lib/constants";
import { duration, easeBrand, gallerySlide } from "@/lib/motion";
import { formatRupiah } from "@/lib/utils";
import type { ProductDTO } from "@/types/api";

/**
 * Blok teks produk yang ikut slide bersama imagery (REFACTOR-05):
 * offset lebih kecil + delay tipis dari gambar — depth antar lapisan,
 * bukan blok statis yang terputus dari transisi.
 */
const infoVariants: Variants = {
  enter: (dir: number) => ({
    x: dir * gallerySlide.textOffsetPx,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      duration: duration.base,
      ease: easeBrand,
      delay: gallerySlide.textDelay,
    },
  },
  exit: (dir: number) => ({
    x: -dir * gallerySlide.textOffsetPx,
    opacity: 0,
    transition: { duration: duration.fast, ease: easeBrand },
  }),
};

export function ProductInfo({
  product,
  direction,
}: {
  product: ProductDTO;
  /** Arah slide aktif — diteruskan ke variants sebagai `custom` */
  direction: number;
}) {
  const waNumber = SOCIAL.whatsapp.replace(/\D+/g, "");
  const orderText = encodeURIComponent(
    `Halo ${BRAND.name}, saya mau pesan "${product.title}" (${formatRupiah(product.price)}). Masih ready?`,
  );

  return (
    <motion.div
      custom={direction}
      variants={infoVariants}
      initial="enter"
      animate="center"
      exit="exit"
      className="flex w-full flex-col"
    >
      <p className="type-label text-accent-666">
        {BRAND.sku} / Rilisan terbatas
      </p>

      <h1 className="type-headline-lg mt-4 text-primary">{product.title}</h1>

      {product.subtitle && (
        <p className="type-label mt-3 text-on-surface-variant">
          {product.subtitle}
        </p>
      )}

      <p className="type-price mt-8 border-t border-outline-variant pt-6 text-primary">
        {formatRupiah(product.price)}
      </p>

      <p className="type-body-lg mt-6 max-w-md text-on-surface-variant">
        Dirilis terbatas dari {BRAND.location}. Habis berarti habis — tidak
        ada restock.
      </p>

      <div className="mt-10">
        <a
          href={`https://wa.me/${waNumber}?text=${orderText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="type-label group inline-flex items-center gap-2 border border-primary bg-primary px-8 py-4 text-on-primary hover:bg-transparent hover:text-primary"
        >
          Pesan via WhatsApp <ArrowUpRight size={14} />
        </a>
      </div>
    </motion.div>
  );
}
