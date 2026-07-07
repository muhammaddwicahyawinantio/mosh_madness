import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublishedProducts } from "@/lib/products";
import { ProductGallery } from "@/components/product/ProductGallery";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const products = await getPublishedProducts();
  const product = products.find((p) => p.id === id);
  if (!product) return { title: "Produk tidak ditemukan" };
  return {
    title: product.title,
    description:
      product.subtitle ?? `${product.title} — rilisan terbatas Mosh Madness.`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  // Urutan sama dengan katalog (/product) — jadi rel galeri slide
  const products = await getPublishedProducts();
  const product = products.find((p) => p.id === id);
  if (!product) notFound();

  return (
    <main className="bg-blueprint">
      <ProductGallery products={products} initialId={id} />
    </main>
  );
}
