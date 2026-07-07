"use client";

import { useState } from "react";
import Image from "next/image";
import useSWR from "swr";
import { ArrowDown, ArrowUp, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminFetch } from "@/lib/adminApi";
import { jsonFetcher } from "@/lib/fetcher";
import type { AdminSponsorDTO, MediaAssetDTO } from "@/types/api";

/** CRUD sponsor/logo (BACKEND.md §6) — nama, link, urutan, aktif, ganti logo. */
export function SponsorsClient() {
  const { data, error, isLoading, mutate } = useSWR<AdminSponsorDTO[]>(
    "/api/admin/sponsors",
    jsonFetcher,
  );

  // Form panel dipakai untuk create (editing=null) & edit
  const [editing, setEditing] = useState<AdminSponsorDTO | null>(null);
  const [name, setName] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [opError, setOpError] = useState<string | null>(null);

  const startEdit = (s: AdminSponsorDTO) => {
    setEditing(s);
    setName(s.name);
    setLink(s.link ?? "");
    setFile(null);
  };
  const resetForm = () => {
    setEditing(null);
    setName("");
    setLink("");
    setFile(null);
  };

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!data) return;
    if (!editing && !file) {
      setOpError("Pilih file logo dulu");
      return;
    }

    setOpError(null);
    setSaving(true);
    try {
      let mediaId: string | undefined;
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("alt", `Logo ${name.trim()}`);
        const media = await adminFetch<MediaAssetDTO>("/api/admin/upload", {
          method: "POST",
          body: formData,
        });
        mediaId = media.id;
      }

      const payload = {
        name: name.trim(),
        link: link.trim() || null,
        ...(mediaId ? { mediaId } : {}),
        ...(editing
          ? {}
          : { sort: data.reduce((max, s) => Math.max(max, s.sort), -1) + 1 }),
      };
      await adminFetch(
        editing ? `/api/admin/sponsors/${editing.id}` : "/api/admin/sponsors",
        {
          method: editing ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      await mutate();
      resetForm();
    } catch (err) {
      setOpError(err instanceof Error ? err.message : "Gagal menyimpan sponsor");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (s: AdminSponsorDTO) => {
    setOpError(null);
    try {
      await adminFetch(`/api/admin/sponsors/${s.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !s.active }),
      });
      await mutate();
    } catch (err) {
      setOpError(err instanceof Error ? err.message : "Gagal update sponsor");
    }
  };

  /** Tukar sort dengan tetangga di list terurut (dir -1 = naik, +1 = turun). */
  const move = async (index: number, dir: -1 | 1) => {
    if (!data) return;
    const target = data[index];
    const neighbor = data[index + dir];
    if (!target || !neighbor) return;

    setOpError(null);
    try {
      await adminFetch(`/api/admin/sponsors/${target.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort: neighbor.sort }),
      });
      await adminFetch(`/api/admin/sponsors/${neighbor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sort: target.sort }),
      });
      await mutate();
    } catch (err) {
      setOpError(err instanceof Error ? err.message : "Gagal memindahkan sponsor");
    }
  };

  const remove = async (s: AdminSponsorDTO) => {
    if (!window.confirm(`Hapus sponsor "${s.name}"? Logo tetap ada di media library.`)) {
      return;
    }
    setOpError(null);
    try {
      await adminFetch(`/api/admin/sponsors/${s.id}`, { method: "DELETE" });
      if (editing?.id === s.id) resetForm();
      await mutate();
    } catch (err) {
      setOpError(err instanceof Error ? err.message : "Gagal menghapus sponsor");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Form create/edit */}
      <form
        onSubmit={submit}
        className="flex flex-col gap-4 border border-outline-variant bg-surface-container p-4"
      >
        <p className="type-label text-on-surface-variant">
          {editing ? `Edit — ${editing.name}` : "Tambah sponsor"}
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="flex flex-col gap-2">
            <Label htmlFor="sp-name" className="type-label">
              Nama
            </Label>
            <Input
              id="sp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={120}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="sp-link" className="type-label">
              Link (opsional, https://…)
            </Label>
            <Input
              id="sp-link"
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              maxLength={500}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="sp-file" className="type-label">
              Logo {editing ? "(kosongkan = tetap)" : ""}
            </Label>
            <Input
              id="sp-file"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={saving} className="type-label">
            {saving ? "Menyimpan…" : "Simpan"}
          </Button>
          {editing && (
            <Button
              type="button"
              variant="outline"
              onClick={resetForm}
              className="type-label"
            >
              Batal edit
            </Button>
          )}
        </div>
      </form>

      {opError && (
        <p role="alert" className="type-label border border-outline-variant bg-surface-container px-3 py-2 text-error">
          {opError}
        </p>
      )}

      {isLoading ? (
        <p className="type-label text-on-surface-variant">Memuat sponsor…</p>
      ) : error ? (
        <p role="alert" className="type-label text-error">
          Gagal memuat sponsor — cek koneksi database.
        </p>
      ) : !data || data.length === 0 ? (
        <div className="border border-outline-variant bg-surface-container p-8 text-center">
          <p className="type-label text-on-surface-variant">Belum ada sponsor.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border border-outline-variant bg-surface-container">
          <Table>
            <TableHeader>
              <TableRow className="border-outline-variant">
                <TableHead className="type-label w-20">Logo</TableHead>
                <TableHead className="type-label">Nama</TableHead>
                <TableHead className="type-label">Link</TableHead>
                <TableHead className="type-label text-center">Urutan</TableHead>
                <TableHead className="type-label text-center">Aktif</TableHead>
                <TableHead className="type-label text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((sponsor, i) => (
                <TableRow key={sponsor.id} className="border-outline-variant">
                  <TableCell>
                    <div className="relative h-12 w-12 overflow-hidden border border-outline-variant bg-surface-low">
                      <Image
                        src={sponsor.logoUrl}
                        alt={`Logo ${sponsor.name}`}
                        fill
                        sizes="48px"
                        className="object-contain"
                        unoptimized
                      />
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-on-surface">
                    {sponsor.name}
                  </TableCell>
                  <TableCell className="max-w-48 truncate font-mono text-xs text-on-surface-variant">
                    {sponsor.link ?? "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="inline-flex gap-1">
                      <Button
                        variant="outline"
                        size="icon-sm"
                        disabled={i === 0}
                        onClick={() => void move(i, -1)}
                        aria-label={`Naikkan ${sponsor.name}`}
                      >
                        <ArrowUp size={14} />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-sm"
                        disabled={i === data.length - 1}
                        onClick={() => void move(i, 1)}
                        aria-label={`Turunkan ${sponsor.name}`}
                      >
                        <ArrowDown size={14} />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={sponsor.active}
                      onCheckedChange={() => void toggleActive(sponsor)}
                      aria-label={`Aktifkan ${sponsor.name}`}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => startEdit(sponsor)}
                        aria-label={`Edit ${sponsor.name}`}
                      >
                        <Pencil size={14} />
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => void remove(sponsor)}
                        aria-label={`Hapus ${sponsor.name}`}
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
    </div>
  );
}
