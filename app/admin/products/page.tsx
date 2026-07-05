import type { Metadata } from "next";
import { ProductsClient } from "@/components/admin/ProductsClient";

export const metadata: Metadata = { title: "Produk" };

export default function AdminProductsPage() {
  return (
    <main>
      <h1 className="type-headline-md mb-6 text-primary">Produk</h1>
      <ProductsClient />
    </main>
  );
}
