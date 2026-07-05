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
      <header className="mx-auto max-w-[1600px] px-4 pb-16 pt-40 md:px-8">
        <p className="type-label mb-6 text-accent-666">
          Katalog / {BRAND.sku}
        </p>
        <h1 className="type-display-xl text-primary">Semua drop</h1>
        <p className="type-body-lg mt-6 max-w-md text-on-surface-variant">
          Setiap artikel dirilis terbatas. Habis berarti habis — tidak ada
          restock, tidak ada nostalgia.
        </p>
      </header>

      <Marquee text={`${BRAND.name} — rilisan terbatas — ${BRAND.estCode}`} />

      <div className="mx-auto max-w-[1600px] px-4 py-16 md:px-8">
        <ProductGrid />
      </div>
    </main>
  );
}
