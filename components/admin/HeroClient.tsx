"use client";

import { useState } from "react";
import Image from "next/image";
import useSWR from "swr";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { adminFetch } from "@/lib/adminApi";
import { jsonFetcher } from "@/lib/fetcher";
import type { AdminHeroDTO, MediaAssetDTO } from "@/types/api";

const VARIANTS = ["BLACK", "WHITE"] as const;

const VARIANT_LABEL: Record<(typeof VARIANTS)[number], string> = {
  BLACK: "Varian hitam (default)",
  WHITE: "Varian putih (hover swap)",
};

/** Kelola 2-image swap hero (BACKEND.md §6) — upload/hapus per varian, aktif/nonaktif. */
export function HeroClient() {
  const { data, error, isLoading, mutate } = useSWR<AdminHeroDTO[]>(
    "/api/admin/hero",
    jsonFetcher,
  );
  const [uploading, setUploading] = useState<string | null>(null);
  const [opError, setOpError] = useState<string | null>(null);

  const upload = async (
    variant: (typeof VARIANTS)[number],
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !data) return;

    setOpError(null);
    setUploading(variant);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("alt", `Hero garment ${variant.toLowerCase()}`);
      const media = await adminFetch<MediaAssetDTO>("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const nextSort =
        data
          .filter((h) => h.variant === variant)
          .reduce((max, h) => Math.max(max, h.sort), -1) + 1;
      await adminFetch("/api/admin/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant, mediaId: media.id, sort: nextSort }),
      });
      await mutate();
    } catch (err) {
      setOpError(err instanceof Error ? err.message : "Gagal upload hero");
    } finally {
      setUploading(null);
    }
  };

  const toggleActive = async (item: AdminHeroDTO) => {
    setOpError(null);
    try {
      await adminFetch(`/api/admin/hero/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !item.active }),
      });
      await mutate();
    } catch (err) {
      setOpError(err instanceof Error ? err.message : "Gagal update hero");
    }
  };

  const remove = async (item: AdminHeroDTO) => {
    if (!window.confirm("Hapus image hero ini? File tetap ada di media library.")) {
      return;
    }
    setOpError(null);
    try {
      await adminFetch(`/api/admin/hero/${item.id}`, { method: "DELETE" });
      await mutate();
    } catch (err) {
      setOpError(err instanceof Error ? err.message : "Gagal menghapus hero");
    }
  };

  if (isLoading) {
    return <p className="type-label text-on-surface-variant">Memuat hero…</p>;
  }
  if (error || !data) {
    return (
      <p role="alert" className="type-label text-error">
        Gagal memuat hero — cek koneksi database.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {opError && (
        <p role="alert" className="type-label border border-outline-variant bg-surface-container px-3 py-2 text-error">
          {opError}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {VARIANTS.map((variant) => {
          const items = data.filter((h) => h.variant === variant);
          return (
            <section
              key={variant}
              aria-label={VARIANT_LABEL[variant]}
              className="flex flex-col gap-3 border border-outline-variant bg-surface-container p-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="type-label text-on-surface-variant">
                  {VARIANT_LABEL[variant]}
                </h2>
                <Label
                  htmlFor={`hero-upload-${variant}`}
                  className="type-label cursor-pointer border border-outline-variant px-3 py-2 hover:bg-surface-highest"
                >
                  {uploading === variant ? "Mengunggah…" : "+ Upload"}
                </Label>
                <input
                  id={`hero-upload-${variant}`}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  disabled={uploading !== null}
                  onChange={(e) => void upload(variant, e)}
                  className="sr-only"
                />
              </div>

              {items.length === 0 ? (
                <p className="type-label py-6 text-center text-outline">
                  Belum ada image — hero pakai fallback.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 border border-outline-variant bg-surface-low p-2"
                    >
                      <div className="relative h-20 w-16 shrink-0 overflow-hidden border border-outline-variant">
                        <Image
                          src={item.url}
                          alt={item.alt || `Hero ${variant}`}
                          fill
                          sizes="64px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <p className="min-w-0 flex-1 truncate text-xs text-on-surface-variant">
                        {item.url}
                      </p>
                      <Switch
                        checked={item.active}
                        onCheckedChange={() => void toggleActive(item)}
                        aria-label={`Aktifkan image hero ${variant}`}
                      />
                      <Button
                        variant="destructive"
                        size="icon-sm"
                        onClick={() => void remove(item)}
                        aria-label="Hapus image hero"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
