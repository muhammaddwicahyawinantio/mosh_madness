"use client";

import { useState } from "react";
import useSWR from "swr";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { adminFetch } from "@/lib/adminApi";
import { jsonFetcher } from "@/lib/fetcher";
import type { SiteContentDTO } from "@/types/api";

/** Satu baris konten — textarea + simpan per key. */
function ContentRow({
  row,
  onSaved,
}: {
  row: SiteContentDTO;
  onSaved: () => void;
}) {
  const [value, setValue] = useState(row.value);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dirty = value !== row.value;

  const save = async () => {
    setError(null);
    setSaving(true);
    try {
      await adminFetch(`/api/admin/content/${encodeURIComponent(row.key)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-2 border border-outline-variant bg-surface-container p-4">
      <div className="flex items-center justify-between">
        <Label htmlFor={`content-${row.key}`} className="type-label text-accent-666">
          {row.key}
        </Label>
        <span className="type-label text-outline">
          diubah {new Date(row.updatedAt).toLocaleDateString("id-ID")}
        </span>
      </div>
      <textarea
        id={`content-${row.key}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={5000}
        rows={value.length > 120 ? 4 : 2}
        className="w-full border border-input bg-transparent px-3 py-2 text-sm text-on-surface outline-none"
      />
      <div className="flex items-center justify-between">
        {error ? (
          <p role="alert" className="type-label text-error">
            {error}
          </p>
        ) : (
          <span />
        )}
        <Button
          size="sm"
          className="type-label"
          disabled={!dirty || saving}
          onClick={() => void save()}
        >
          {saving ? "Menyimpan…" : dirty ? "Simpan" : "Tersimpan"}
        </Button>
      </div>
    </div>
  );
}

/** Edit teks section (hero word, about writer, marquee, contact info — BACKEND.md §6). */
export function ContentClient() {
  const { data, error, isLoading, mutate } = useSWR<SiteContentDTO[]>(
    "/api/admin/content",
    jsonFetcher,
  );

  if (isLoading) {
    return <p className="type-label text-on-surface-variant">Memuat konten…</p>;
  }
  if (error || !data) {
    return (
      <p role="alert" className="type-label text-error">
        Gagal memuat konten — cek koneksi database.
      </p>
    );
  }
  if (data.length === 0) {
    return (
      <div className="border border-outline-variant bg-surface-container p-8 text-center">
        <p className="type-label text-on-surface-variant">
          Belum ada konten — jalankan seed dulu (`npx prisma db seed`).
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((row) => (
        <ContentRow key={`${row.key}:${row.updatedAt}`} row={row} onSaved={() => void mutate()} />
      ))}
    </div>
  );
}
