import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetail } from "@/components/sections/ProductDetail";
import type { ProductDTO } from "@/types/api";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

async function getProduct(id: string): Promise<ProductDTO | null> {
  return prisma.product.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      subtitle: true,
      price: true,
      imageUrl: true,
      showOnHome: true,
      sortOrder: true,
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return { title: "Produk tidak ditemukan" };
  return {
    title: product.title,
    description: product.subtitle ?? `${product.title} — rilisan terbatas Mosh Madness.`,
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <main className="bg-blueprint">
      <ProductDetail product={product} />
    </main>
  );
}
