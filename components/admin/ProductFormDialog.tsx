"use client";

import { useState } from "react";
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
import type { ProductDTO } from "@/types/api";

type Props = {
  /** null = mode create. Render dengan `key` unik supaya state ke-reset. */
  product: ProductDTO | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
};

/**
 * Form create/edit produk. Gambar di-upload ke ImageKit via
 * /api/admin/upload saat submit, baru produk disimpan.
 */
export function ProductFormDialog({ product, open, onOpenChange, onSaved }: Props) {
  const [title, setTitle] = useState(product?.title ?? "");
  const [subtitle, setSubtitle] = useState(product?.subtitle ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [sortOrder, setSortOrder] = useState(
    product ? String(product.sortOrder) : "0",
  );
  const [showOnHome, setShowOnHome] = useState(product?.showOnHome ?? false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    setFile(selected);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(selected ? URL.createObjectURL(selected) : null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const priceInt = Number.parseInt(price, 10);
    if (Number.isNaN(priceInt) || priceInt < 0) {
      setError("Harga harus angka ≥ 0");
      return;
    }
    if (!product && !file) {
      setError("Pilih gambar produk dulu");
      return;
    }

    setSaving(true);
    try {
      let image: { imageUrl: string; imageFileId: string } | undefined;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const uploaded = await adminFetch<{ url: string; fileId: string }>(
          "/api/admin/upload",
          { method: "POST", body: formData },
        );
        image = { imageUrl: uploaded.url, imageFileId: uploaded.fileId };
      }

      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        price: priceInt,
        sortOrder: Number.parseInt(sortOrder, 10) || 0,
        showOnHome,
        ...image,
      };

      await adminFetch(
        product ? `/api/admin/products/${product.id}` : "/api/admin/products",
        {
          method: product ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan produk");
    } finally {
      setSaving(false);
    }
  };

  const shownImage = preview ?? product?.imageUrl ?? null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-outline-variant bg-surface-container sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="type-headline-md font-normal text-primary">
            {product ? "Edit produk" : "Tambah produk"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-start gap-4">
            <div className="relative h-32 w-24 shrink-0 overflow-hidden border border-outline-variant bg-surface-low">
              {shownImage ? (
                // Preview blob/remote — next/image butuh host terdaftar, pakai img
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={shownImage}
                  alt="Preview produk"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="type-label flex h-full items-center justify-center text-outline">
                  No img
                </span>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor="pf-image" className="type-label">
                Gambar (JPEG/PNG/WebP/AVIF, maks 8MB)
              </Label>
              <Input
                id="pf-image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleFile}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="pf-title" className="type-label">
              Judul
            </Label>
            <Input
              id="pf-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={120}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="pf-subtitle" className="type-label">
              Subtitle (opsional)
            </Label>
            <Input
              id="pf-subtitle"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              maxLength={160}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="pf-sort" className="type-label">
                Urutan
              </Label>
              <Input
                id="pf-sort"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between border border-outline-variant px-3 py-2">
            <Label htmlFor="pf-home" className="type-label">
              Tampilkan di Home (Section 3)
            </Label>
            <Switch
              id="pf-home"
              checked={showOnHome}
              onCheckedChange={setShowOnHome}
            />
          </div>

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
              Batal
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
