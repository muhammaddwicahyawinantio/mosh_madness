"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { SafeImage } from "@/components/shared/SafeImage";
import { BRAND, SOCIAL } from "@/lib/constants";
import { formatRupiah } from "@/lib/utils";
import {
  imageZoom,
  revealStagger,
  revealUp,
  wipeUp,
} from "@/lib/motion";
import type { ProductDTO } from "@/types/api";

/**
 * Detail produk /product/[id] — imagery parallax zoom + info stagger.
 * CTA pesan via WhatsApp dengan pesan terisi nama produk.
 */
export function ProductDetail({ product }: { product: ProductDTO }) {
  const imageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: imageRef,
    offset: ["start end", "end start"],
  });
  const imageScale = useTransform(
    scrollYProgress,
    [0, 1],
    [imageZoom.from, imageZoom.to],
  );

  const waNumber = SOCIAL.whatsapp.replace(/\D+/g, "");
  const orderText = encodeURIComponent(
    `Halo ${BRAND.name}, saya mau pesan "${product.title}" (${formatRupiah(product.price)}). Masih ready?`,
  );

  return (
    <div className="mx-auto grid max-w-[1600px] gap-12 px-4 pb-32 pt-28 md:px-8 lg:grid-cols-12 lg:gap-8">
      {/* Imagery — parallax zoom dalam frame */}
      <motion.div
        ref={imageRef}
        variants={wipeUp}
        initial="hidden"
        animate="visible"
        className="relative aspect-[3/4] overflow-hidden border border-outline-variant lg:col-span-6"
      >
        <motion.div className="absolute inset-0" style={{ scale: imageScale }}>
          <SafeImage
            src={product.imageUrl}
            alt={product.title}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />
        </motion.div>
        <span className="type-label absolute bottom-3 left-3 bg-surface-lowest px-2 py-1 text-on-surface-variant">
          {BRAND.sku} / {BRAND.estCode}
        </span>
      </motion.div>

      {/* Info */}
      <motion.div
        variants={revealStagger}
        initial="hidden"
        animate="visible"
        className="flex flex-col justify-center lg:col-span-5 lg:col-start-8"
      >
        <motion.div variants={revealUp}>
          <Link
            href="/product"
            className="type-label hover-invert -mx-2 inline-flex items-center gap-2 px-2 py-1 text-on-surface-variant"
          >
            <ArrowLeft size={12} /> Kembali ke katalog
          </Link>
        </motion.div>

        <motion.p variants={revealUp} className="type-label mt-10 text-accent-666">
          {BRAND.sku} / Rilisan terbatas
        </motion.p>

        <motion.h1 variants={revealUp} className="type-headline-lg mt-4 text-primary">
          {product.title}
        </motion.h1>

        {product.subtitle && (
          <motion.p
            variants={revealUp}
            className="type-label mt-3 text-on-surface-variant"
          >
            {product.subtitle}
          </motion.p>
        )}

        <motion.p
          variants={revealUp}
          className="type-price mt-8 border-t border-outline-variant pt-6 text-primary"
        >
          {formatRupiah(product.price)}
        </motion.p>

        <motion.p
          variants={revealUp}
          className="type-body-lg mt-6 max-w-md text-on-surface-variant"
        >
          Dirilis terbatas dari {BRAND.location}. Habis berarti habis —
          tidak ada restock.
        </motion.p>

        <motion.div variants={revealUp} className="mt-10">
          <a
            href={`https://wa.me/${waNumber}?text=${orderText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="type-label group inline-flex items-center gap-2 border border-primary bg-primary px-8 py-4 text-on-primary hover:bg-transparent hover:text-primary"
          >
            Pesan via WhatsApp <ArrowUpRight size={14} />
          </a>
        </motion.div>

        <motion.dl
          variants={revealUp}
          className="type-label mt-12 grid grid-cols-2 gap-y-3 border-t border-outline-variant pt-6 text-on-surface-variant"
        >
          <dt className="text-outline">Brand</dt>
          <dd>{BRAND.name}</dd>
          <dt className="text-outline">Origin</dt>
          <dd>{BRAND.location}</dd>
          <dt className="text-outline">Est.</dt>
          <dd>{BRAND.established}</dd>
        </motion.dl>
      </motion.div>
    </div>
  );
}
