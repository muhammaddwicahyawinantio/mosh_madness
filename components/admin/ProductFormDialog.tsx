"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { adminFetch } from "@/lib/adminApi";
import type {
  AdminProductDTO,
  AdminProductImageDTO,
  MediaAssetDTO,
} from "@/types/api";

type Props = {
  /** null = mode create. Render dengan `key` unik supaya state ke-reset. */
  product: AdminProductDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Create sukses → dipanggil dengan produk baru supaya parent pindah ke mode edit (lanjut upload foto). */
  onSaved: (created?: AdminProductDTO) => void;
};

const STATUS_OPTIONS = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;

/**
 * Form create/edit produk (schema baru — BACKEND.md §2).
 * Edit mode punya image manager: upload → /api/admin/upload (storage
 * project) lalu attach ke produk; set primary / reorder / lepas image.
 */
export function ProductFormDialog({ product, open, onOpenChange, onSaved }: Props) {
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "0");
  const [compareAt, setCompareAt] = useState(
    product?.compareAt != null ? String(product.compareAt) : "",
  );
  const [category, setCategory] = useState(product?.category ?? "");
  const [status, setStatus] = useState<AdminProductDTO["status"]>(
    product?.status ?? "DRAFT",
  );
  const [showInHome, setShowInHome] = useState(product?.showInHome ?? false);
  const [showInParallax, setShowInParallax] = useState(
    product?.showInParallax ?? false,
  );
  const [images, setImages] = useState<AdminProductImageDTO[]>(
    product?.images ?? [],
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const priceInt = Number.parseInt(price, 10);
    if (Number.isNaN(priceInt) || priceInt < 0) {
      setError("Harga harus angka ≥ 0");
      return;
    }
    const compareAtInt = compareAt.trim()
      ? Number.parseInt(compareAt, 10)
      : null;
    if (compareAtInt != null && (Number.isNaN(compareAtInt) || compareAtInt < 0)) {
      setError("Harga coret harus angka ≥ 0");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        price: priceInt,
        compareAt: compareAtInt,
        category: category.trim() || null,
        status,
        showInHome,
        showInParallax,
      };
      const saved = await adminFetch<AdminProductDTO>(
        product ? `/api/admin/products/${product.id}` : "/api/admin/products",
        {
          method: product ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (product) {
        onSaved();
        onOpenChange(false);
      } else {
        // Tetap terbuka di mode edit supaya bisa langsung upload foto
        onSaved(saved);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan produk");
    } finally {
      setSaving(false);
    }
  };

  // ---------- Image manager (edit mode) ----------

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!product) return;
    const files = Array.from(e.target.files ?? []);
    e.target.value = ""; // reset supaya file sama bisa dipilih ulang
    if (files.length === 0) return;

    setError(null);
    setUploading(true);
    try {
      let nextSort = images.reduce((max, img) => Math.max(max, img.sort), -1) + 1;
      let hasPrimary = images.some((img) => img.isPrimary);
      const added: AdminProductImageDTO[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("alt", name.trim() || product.name);
        const media = await adminFetch<MediaAssetDTO>("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        const image = await adminFetch<AdminProductImageDTO>(
          `/api/admin/products/${product.id}/images`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mediaId: media.id,
              isPrimary: !hasPrimary,
              sort: nextSort,
            }),
          },
        );
        added.push(image);
        hasPrimary = true;
        nextSort += 1;
      }
      setImages((prev) => [...prev, ...added]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal upload gambar");
    } finally {
      setUploading(false);
    }
  };

  const setPrimary = async (image: AdminProductImageDTO) => {
    if (!product || image.isPrimary) return;
    setError(null);
    try {
      await adminFetch(`/api/admin/products/${product.id}/images/${image.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPrimary: true }),
      });
      setImages((prev) =>
        prev.map((img) => ({ ...img, isPrimary: img.id === image.id })),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal set primary");
    }
  };

  /** Tukar sort dengan tetangga (dir -1 = naik, +1 = turun). */
  const move = async (index: number, dir: -1 | 1) => {
    if (!product) return;
    const target = images[index];
    const neighbor = images[index + dir];
    if (!target || !neighbor) return;

    setError(null);
    try {
      await adminFetch(`/api/admin/products/${product.id}/images/${target.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort: neighbor.sort }),
      });
      await adminFetch(
        `/api/admin/products/${product.id}/images/${neighbor.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sort: target.sort }),
        },
      );
      setImages((prev) => {
        const next = [...prev];
        next[index] = { ...neighbor, sort: target.sort };
        next[index + dir] = { ...target, sort: neighbor.sort };
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memindahkan gambar");
    }
  };

  const removeImage = async (image: AdminProductImageDTO) => {
    if (!product) return;
    if (!window.confirm("Lepas gambar dari produk? File tetap ada di media library.")) {
      return;
    }
    setError(null);
    try {
      await adminFetch(`/api/admin/products/${product.id}/images/${image.id}`, {
        method: "DELETE",
      });
      setImages((prev) => prev.filter((img) => img.id !== image.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus gambar");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90svh] overflow-y-auto border-outline-variant bg-surface-container sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="type-headline-md font-normal text-primary">
            {product ? "Edit produk" : "Tambah produk"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="pf-name" className="type-label">
              Nama
            </Label>
            <Input
              id="pf-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={120}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="pf-description" className="type-label">
              Deskripsi
            </Label>
            <textarea
              id="pf-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
              rows={3}
              className="w-full border border-input bg-transparent px-3 py-2 text-sm text-on-surface outline-none placeholder:text-outline"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="pf-price" className="type-label">
                Harga (Rp)
              </Label>
              <Input
                id="pf-price"
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="pf-compare" className="type-label">
                Harga coret (opsional)
              </Label>
              <Input
                id="pf-compare"
                type="number"
                min={0}
                value={compareAt}
                onChange={(e) => setCompareAt(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="pf-category" className="type-label">
                Kategori (opsional)
              </Label>
              <Input
                id="pf-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                maxLength={80}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="pf-status" className="type-label">
              Status
            </Label>
            <select
              id="pf-status"
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as AdminProductDTO["status"])
              }
              className="h-9 border border-input bg-surface-container px-3 text-sm text-on-surface outline-none"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            <div className="flex items-center justify-between border border-outline-variant px-3 py-2">
              <Label htmlFor="pf-home" className="type-label">
                Tampil di Home
              </Label>
              <Switch
                id="pf-home"
                checked={showInHome}
                onCheckedChange={setShowInHome}
              />
            </div>
            <div className="flex items-center justify-between border border-outline-variant px-3 py-2">
              <Label htmlFor="pf-parallax" className="type-label">
                Masuk Parallax (max 7)
              </Label>
              <Switch
                id="pf-parallax"
                checked={showInParallax}
                onCheckedChange={setShowInParallax}
              />
            </div>
          </div>

          {/* Image manager — hanya setelah produk tersimpan */}
          {product ? (
            <div className="flex flex-col gap-3 border border-outline-variant p-3">
              <div className="flex items-center justify-between">
                <p className="type-label text-on-surface-variant">
                  Foto ({images.length})
                </p>
                <Label
                  htmlFor="pf-upload"
                  className="type-label cursor-pointer border border-outline-variant px-3 py-2 hover:bg-surface-highest"
                >
                  {uploading ? "Mengunggah…" : "+ Upload foto"}
                </Label>
                <input
                  id="pf-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  multiple
                  disabled={uploading}
                  onChange={handleUpload}
                  className="sr-only"
                />
              </div>

              {images.length === 0 ? (
                <p className="type-label py-4 text-center text-outline">
                  Belum ada foto — produk tanpa foto tidak tampil di publik.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {images.map((image, i) => (
                    <li
                      key={image.id}
                      className="flex items-center gap-3 border border-outline-variant bg-surface-low p-2"
                    >
                      {/* Thumb kecil — object URL / path storage, next/image nggak perlu */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="h-16 w-12 shrink-0 border border-outline-variant object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs text-on-surface-variant">
                          {image.url}
                        </p>
                        {image.isPrimary && (
                          <p className="type-label mt-1 text-accent-666">
                            Primary — dipakai kartu & parallax
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          disabled={image.isPrimary}
                          onClick={() => void setPrimary(image)}
                          aria-label="Jadikan primary"
                          title="Jadikan primary"
                        >
                          <Star
                            size={14}
                            fill={image.isPrimary ? "currentColor" : "none"}
                          />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          disabled={i === 0}
                          onClick={() => void move(i, -1)}
                          aria-label="Naikkan urutan"
                        >
                          <ArrowUp size={14} />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-sm"
                          disabled={i === images.length - 1}
                          onClick={() => void move(i, 1)}
                          aria-label="Turunkan urutan"
                        >
                          <ArrowDown size={14} />
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-sm"
                          onClick={() => void removeImage(image)}
                          aria-label="Lepas gambar"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p className="type-label border border-outline-variant px-3 py-2 text-outline">
              Simpan dulu — upload foto terbuka setelah produk dibuat.
            </p>
          )}

          {error && (
            <p role="alert" className="type-label text-error">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              {product ? "Tutup" : "Batal"}
            </Button>
            <Button type="submit" disabled={saving || uploading}>
              {saving ? "Menyimpan…" : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
