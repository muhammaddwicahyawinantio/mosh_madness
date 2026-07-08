"use client";

import Link from "next/link";
import useSWR from "swr";
import { motion } from "motion/react";
import { SafeImage } from "@/components/shared/SafeImage";
import { jsonFetcher } from "@/lib/fetcher";
import { formatRupiah } from "@/lib/utils";
import { revealUp } from "@/lib/motion";
import type { ProductDTO } from "@/types/api";

/**
 * Grid katalog /product — blueprint cells 1px border (DESIGN.md §4),
 * staggered reveal per cell, hover invert instan. Semua produk dari API.
 */
export function ProductGrid() {
  const { data, error, isLoading } = useSWR<ProductDTO[]>(
    "/api/products",
    jsonFetcher,
    { revalidateOnFocus: true },
  );

  if (isLoading) {
    return (
      <div
        aria-hidden="true"
        className="grid grid-cols-2 gap-px border border-outline-variant bg-outline-variant lg:grid-cols-3 xl:grid-cols-4"
      >
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="aspect-[3/4] bg-surface-low" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-blueprint flex h-64 items-center justify-center border border-outline-variant">
        <p className="type-label text-error">Gagal memuat katalog — coba refresh</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-blueprint flex h-64 items-center justify-center border border-outline-variant">
        <p className="type-label text-on-surface-variant">
          Katalog masih kosong — drop pertama segera
        </p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-px border border-outline-variant bg-outline-variant lg:grid-cols-3 xl:grid-cols-4">
      {data.map((product, i) => (
        <motion.li
          key={product.id}
          variants={revealUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <Link
            href={`/product/${product.id}`}
            className="group flex h-full flex-col bg-surface"
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <SafeImage
                src={product.imageUrl}
                alt={product.title}
                fill
                sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw"
                className="object-cover"
              />
              <span className="type-label absolute left-3 top-3 bg-surface-lowest px-2 py-1 text-on-surface-variant">
                {String(i + 1).padStart(3, "0")}
              </span>
            </div>
            {/* Hover invert instan — identitas brutalist. Mobile: stack
                judul & harga (cell 2-kolom sempit); desktop: baris seperti semula. */}
            <div className="hover-invert flex flex-1 flex-col gap-1 border-t border-outline-variant p-3 group-hover:bg-primary group-hover:text-on-primary md:flex-row md:items-end md:justify-between md:gap-2 md:p-4">
              <div className="min-w-0">
                <p className="type-metal text-xl uppercase md:text-[2rem]">{product.title}</p>
                {product.subtitle && (
                  <p className="type-label mt-1 opacity-70">{product.subtitle}</p>
                )}
              </div>
              <p className="type-price shrink-0">{formatRupiah(product.price)}</p>
            </div>
          </Link>
        </motion.li>
      ))}
    </ul>
  );
}
