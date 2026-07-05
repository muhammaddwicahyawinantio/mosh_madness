"use client";

import { useState } from "react";
import Image from "next/image";
import useSWR from "swr";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductFormDialog } from "@/components/admin/ProductFormDialog";
import { adminFetch } from "@/lib/adminApi";
import { jsonFetcher } from "@/lib/fetcher";
import { formatRupiah } from "@/lib/utils";
import type { ProductDTO } from "@/types/api";

export function ProductsClient() {
  const { data, error, isLoading, mutate } = useSWR<ProductDTO[]>(
    "/api/products",
    jsonFetcher,
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProductDTO | null>(null);
  const [opError, setOpError] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (product: ProductDTO) => {
    setEditing(product);
    setDialogOpen(true);
  };

  /** Toggle "Tampil di Home" — optimistic update, rollback kalau gagal */
  const toggleHome = async (product: ProductDTO) => {
    if (!data) return;
    setOpError(null);
    const next = data.map((p) =>
      p.id === product.id ? { ...p, showOnHome: !p.showOnHome } : p,
    );
    await mutate(next, { revalidate: false });
    try {
      await adminFetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showOnHome: !product.showOnHome }),
      });
    } catch (err) {
      setOpError(err instanceof Error ? err.message : "Gagal update toggle");
      await mutate(); // rollback ke data server
    }
  };

  const remove = async (product: ProductDTO) => {
    if (!window.confirm(`Hapus "${product.title}"? File ImageKit ikut dihapus.`)) {
      return;
    }
    setOpError(null);
    try {
      await adminFetch(`/api/admin/products/${product.id}`, {
        method: "DELETE",
      });
      await mutate();
    } catch (err) {
      setOpError(err instanceof Error ? err.message : "Gagal menghapus produk");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="type-label text-on-surface-variant">
          {data ? `${data.length} produk` : "…"}
        </p>
        <Button onClick={openCreate} className="type-label">
          <Plus size={14} /> Tambah produk
        </Button>
      </div>

      {opError && (
        <p role="alert" className="type-label border border-outline-variant bg-surface-container px-3 py-2 text-error">
          {opError}
        </p>
      )}

      {isLoading ? (
        <p className="type-label text-on-surface-variant">Memuat produk…</p>
      ) : error ? (
        <p role="alert" className="type-label text-error">
          Gagal memuat produk — cek koneksi database.
        </p>
      ) : !data || data.length === 0 ? (
        <div className="border border-outline-variant bg-surface-container p-8 text-center">
          <p className="type-label text-on-surface-variant">
            Belum ada produk. Klik &quot;Tambah produk&quot; untuk mulai.
          </p>
        </div>
      ) : (
        <div className="border border-outline-variant bg-surface-container">
          <Table>
            <TableHeader>
              <TableRow className="border-outline-variant">
                <TableHead className="type-label w-20">Gambar</TableHead>
                <TableHead className="type-label">Produk</TableHead>
                <TableHead className="type-label text-right">Harga</TableHead>
                <TableHead className="type-label text-right">Urutan</TableHead>
                <TableHead className="type-label text-center">Home</TableHead>
                <TableHead className="type-label text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((product) => (
                <TableRow key={product.id} className="border-outline-variant">
                  <TableCell>
                    <div className="relative h-16 w-12 overflow-hidden border border-outline-variant bg-surface-low">
                      <Image
                        src={product.imageUrl}
                        alt={product.title}
                        fill
                        sizes="48px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-on-surface">{product.title}</p>
                    {product.subtitle && (
                      <p className="type-label mt-1 text-outline">
                        {product.subtitle}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {formatRupiah(product.price)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {product.sortOrder}
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={product.showOnHome}
                      onCheckedChange={() => toggleHome(product)}
                      aria-label={`Tampilkan ${product.title} di home`}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => openEdit(product)}
                        aria-label={`Edit ${product.title}`}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => remove(product)}
                        aria-label={`Hapus ${product.title}`}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* key = reset state form tiap ganti target */}
      <ProductFormDialog
        key={editing?.id ?? "create"}
        product={editing}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSaved={() => void mutate()}
      />
    </div>
  );
}
