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
import type { AdminProductDTO } from "@/types/api";

const STATUS_STYLE: Record<AdminProductDTO["status"], string> = {
  DRAFT: "text-outline",
  PUBLISHED: "text-on-surface",
  ARCHIVED: "text-error",
};

export function ProductsClient() {
  const { data, error, isLoading, mutate } = useSWR<AdminProductDTO[]>(
    "/api/admin/products",
    jsonFetcher,
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminProductDTO | null>(null);
  const [opError, setOpError] = useState<string | null>(null);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (product: AdminProductDTO) => {
    setEditing(product);
    setDialogOpen(true);
  };

  /** Create sukses → pindah ke mode edit (upload foto); edit sukses → refresh. */
  const handleSaved = (created?: AdminProductDTO) => {
    void mutate();
    if (created) setEditing(created);
  };

  /** Toggle flag boolean — optimistic update, rollback kalau gagal */
  const toggleFlag = async (
    product: AdminProductDTO,
    flag: "showInHome" | "showInParallax",
  ) => {
    if (!data) return;
    setOpError(null);
    const value = !product[flag];
    const next = data.map((p) =>
      p.id === product.id ? { ...p, [flag]: value } : p,
    );
    await mutate(next, { revalidate: false });
    try {
      await adminFetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [flag]: value }),
      });
    } catch (err) {
      setOpError(err instanceof Error ? err.message : "Gagal update toggle");
      await mutate(); // rollback ke data server
    }
  };

  const setStatus = async (
    product: AdminProductDTO,
    status: AdminProductDTO["status"],
  ) => {
    setOpError(null);
    try {
      await adminFetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      await mutate();
    } catch (err) {
      setOpError(err instanceof Error ? err.message : "Gagal update status");
    }
  };

  const remove = async (product: AdminProductDTO) => {
    if (
      !window.confirm(
        `Hapus "${product.name}"? Foto tetap tersimpan di media library.`,
      )
    ) {
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
        <div className="overflow-x-auto border border-outline-variant bg-surface-container">
          <Table>
            <TableHeader>
              <TableRow className="border-outline-variant">
                <TableHead className="type-label w-20">Gambar</TableHead>
                <TableHead className="type-label">Produk</TableHead>
                <TableHead className="type-label text-right">Harga</TableHead>
                <TableHead className="type-label">Status</TableHead>
                <TableHead className="type-label text-center">Home</TableHead>
                <TableHead className="type-label text-center">Parallax</TableHead>
                <TableHead className="type-label text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((product) => {
                const primary = product.images[0];
                return (
                  <TableRow key={product.id} className="border-outline-variant">
                    <TableCell>
                      <div className="relative h-16 w-12 overflow-hidden border border-outline-variant bg-surface-low">
                        {primary ? (
                          <Image
                            src={primary.url}
                            alt={primary.alt || product.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <span className="type-label flex h-full items-center justify-center text-outline">
                            —
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-on-surface">{product.name}</p>
                      <p className="type-label mt-1 text-outline">
                        {product.slug}
                        {product.category ? ` · ${product.category}` : ""}
                        {` · ${product.images.length} foto`}
                      </p>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">
                      <p>{formatRupiah(product.price)}</p>
                      {product.compareAt != null && (
                        <p className="text-outline line-through">
                          {formatRupiah(product.compareAt)}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <select
                        value={product.status}
                        onChange={(e) =>
                          void setStatus(
                            product,
                            e.target.value as AdminProductDTO["status"],
                          )
                        }
                        aria-label={`Status ${product.name}`}
                        className={`border border-outline-variant bg-surface-container px-2 py-1 font-mono text-xs outline-none ${STATUS_STYLE[product.status]}`}
                      >
                        <option value="DRAFT">DRAFT</option>
                        <option value="PUBLISHED">PUBLISHED</option>
                        <option value="ARCHIVED">ARCHIVED</option>
                      </select>
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={product.showInHome}
                        onCheckedChange={() =>
                          void toggleFlag(product, "showInHome")
                        }
                        aria-label={`Tampilkan ${product.name} di home`}
                      />
                    </TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={product.showInParallax}
                        onCheckedChange={() =>
                          void toggleFlag(product, "showInParallax")
                        }
                        aria-label={`Masukkan ${product.name} ke parallax`}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => openEdit(product)}
                          aria-label={`Edit ${product.name}`}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => void remove(product)}
                          aria-label={`Hapus ${product.name}`}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
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
        onSaved={handleSaved}
      />
    </div>
  );
}
