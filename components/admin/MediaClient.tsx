"use client";

import { useState } from "react";
import Image from "next/image";
import useSWR from "swr";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { adminFetch } from "@/lib/adminApi";
import { jsonFetcher } from "@/lib/fetcher";
import type { MediaAssetDTO } from "@/types/api";

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/** Satu kartu media — alt editable, hapus (DB + file, ditolak kalau masih dipakai). */
function MediaCard({
  asset,
  onChanged,
  onError,
}: {
  asset: MediaAssetDTO;
  onChanged: () => void;
  onError: (msg: string) => void;
}) {
  const [alt, setAlt] = useState(asset.alt);
  const [saving, setSaving] = useState(false);
  const dirty = alt !== asset.alt;

  const saveAlt = async () => {
    setSaving(true);
    try {
      await adminFetch(`/api/admin/media/${asset.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ alt: alt.trim() }),
      });
      onChanged();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Gagal menyimpan alt");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm("Hapus media ini? Row DB dan file fisik ikut terhapus.")) {
      return;
    }
    try {
      await adminFetch(`/api/admin/media/${asset.id}`, { method: "DELETE" });
      onChanged();
    } catch (err) {
      onError(err instanceof Error ? err.message : "Gagal menghapus media");
    }
  };

  return (
    <li className="flex flex-col border border-outline-variant bg-surface-container">
      <div className="relative aspect-square overflow-hidden border-b border-outline-variant bg-surface-low">
        <Image
          src={asset.url}
          alt={asset.alt || "Media tanpa alt"}
          fill
          sizes="(min-width: 1024px) 20vw, 45vw"
          className="object-cover"
          unoptimized
        />
      </div>
      <div className="flex flex-col gap-2 p-3">
        <p className="truncate font-mono text-xs text-on-surface-variant" title={asset.url}>
          {asset.url}
        </p>
        <p className="type-label text-outline">
          {asset.mime}
          {asset.width && asset.height ? ` · ${asset.width}×${asset.height}` : ""}
          {` · ${formatSize(asset.size)}`}
        </p>
        <div className="flex items-end gap-2">
          <div className="flex flex-1 flex-col gap-1">
            <Label htmlFor={`alt-${asset.id}`} className="type-label">
              Alt
            </Label>
            <Input
              id={`alt-${asset.id}`}
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              maxLength={300}
              className="h-8 text-xs"
            />
          </div>
          <Button
            size="sm"
            className="type-label"
            disabled={!dirty || saving}
            onClick={() => void saveAlt()}
          >
            {saving ? "…" : "Simpan"}
          </Button>
          <Button
            variant="destructive"
            size="icon-sm"
            onClick={() => void remove()}
            aria-label="Hapus media"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
    </li>
  );
}

/** Media library — semua upload (BACKEND.md §6). */
export function MediaClient() {
  const { data, error, isLoading, mutate } = useSWR<MediaAssetDTO[]>(
    "/api/admin/media",
    jsonFetcher,
  );
  const [uploading, setUploading] = useState(false);
  const [opError, setOpError] = useState<string | null>(null);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    setOpError(null);
    setUploading(true);
    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        await adminFetch("/api/admin/upload", { method: "POST", body: formData });
      }
      await mutate();
    } catch (err) {
      setOpError(err instanceof Error ? err.message : "Gagal upload media");
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return <p className="type-label text-on-surface-variant">Memuat media…</p>;
  }
  if (error || !data) {
    return (
      <p role="alert" className="type-label text-error">
        Gagal memuat media — cek koneksi database.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="type-label text-on-surface-variant">{data.length} file</p>
        <Label
          htmlFor="media-upload"
          className="type-label cursor-pointer border border-outline-variant px-3 py-2 hover:bg-surface-highest"
        >
          {uploading ? "Mengunggah…" : "+ Upload"}
        </Label>
        <input
          id="media-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          disabled={uploading}
          onChange={(e) => void upload(e)}
          className="sr-only"
        />
      </div>

      {opError && (
        <p role="alert" className="type-label border border-outline-variant bg-surface-container px-3 py-2 text-error">
          {opError}
        </p>
      )}

      {data.length === 0 ? (
        <div className="border border-outline-variant bg-surface-container p-8 text-center">
          <p className="type-label text-on-surface-variant">
            Belum ada media terupload.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {data.map((asset) => (
            <MediaCard
              key={asset.id}
              asset={asset}
              onChanged={() => void mutate()}
              onError={setOpError}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
