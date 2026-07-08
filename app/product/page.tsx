import type { Metadata } from "next";
import { ProductGrid } from "@/components/sections/ProductGrid";
import { Marquee } from "@/components/shared/Marquee";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Katalog",
  description: `Semua drop ${BRAND.name} — streetwear premium dari Banjarmasin.`,
};

export default function ProductPage() {
  return (
    <main className="bg-blueprint">
      {/* Header editorial — di bawah navbar fixed */}
      <header className="mx-auto max-w-[1600px] px-4 pb-12 pt-28 md:px-8 md:pb-16 md:pt-40">
        <p className="type-label mb-4 text-accent-666 md:mb-6">
          Katalog / {BRAND.sku}
        </p>
        {/* Ukuran responsif — melacak clamp type-display-xl lama di ≥md,
            lebih kecil di mobile biar Metal Mania tidak sesak. */}
        <h1 className="type-metal text-[2.75rem] uppercase text-primary sm:text-[3.5rem] md:text-[5rem] lg:text-[6.5rem] xl:text-[7.5rem]">
          All Products
        </h1>
        <p className="type-body-lg mt-4 max-w-md text-on-surface-variant md:mt-6">
          Join the madness, make our outfit cool.
        </p>
      </header>

      <Marquee text={`${BRAND.name} — rilisan terbatas — ${BRAND.estCode}`} />

      <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-8">
        <ProductGrid />
      </div>
    </main>
  );
}
