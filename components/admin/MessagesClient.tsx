"use client";

import { useState } from "react";
import useSWR from "swr";
import { Check, Trash2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { adminFetch } from "@/lib/adminApi";
import { jsonFetcher } from "@/lib/fetcher";
import type { ContactMessageDTO } from "@/types/api";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Pesan form kontak — tandai handled / hapus (BACKEND.md §6). */
export function MessagesClient() {
  const { data, error, isLoading, mutate } = useSWR<ContactMessageDTO[]>(
    "/api/admin/messages",
    jsonFetcher,
  );
  const [opError, setOpError] = useState<string | null>(null);

  const setHandled = async (msg: ContactMessageDTO, handled: boolean) => {
    setOpError(null);
    try {
      await adminFetch(`/api/admin/messages/${msg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ handled }),
      });
      await mutate();
    } catch (err) {
      setOpError(err instanceof Error ? err.message : "Gagal update pesan");
    }
  };

  const remove = async (msg: ContactMessageDTO) => {
    if (!window.confirm(`Hapus pesan dari "${msg.name}"? Tidak bisa dibatalkan.`)) {
      return;
    }
    setOpError(null);
    try {
      await adminFetch(`/api/admin/messages/${msg.id}`, { method: "DELETE" });
      await mutate();
    } catch (err) {
      setOpError(err instanceof Error ? err.message : "Gagal menghapus pesan");
    }
  };

  if (isLoading) {
    return <p className="type-label text-on-surface-variant">Memuat pesan…</p>;
  }
  if (error || !data) {
    return (
      <p role="alert" className="type-label text-error">
        Gagal memuat pesan — cek koneksi database.
      </p>
    );
  }

  const unhandled = data.filter((m) => !m.handled).length;

  return (
    <div className="flex flex-col gap-4">
      <p className="type-label text-on-surface-variant">
        {data.length} pesan · {unhandled} belum ditangani
      </p>

      {opError && (
        <p role="alert" className="type-label border border-outline-variant bg-surface-container px-3 py-2 text-error">
          {opError}
        </p>
      )}

      {data.length === 0 ? (
        <div className="border border-outline-variant bg-surface-container p-8 text-center">
          <p className="type-label text-on-surface-variant">
            Belum ada pesan masuk.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {data.map((msg) => (
            <li
              key={msg.id}
              className={`flex flex-col gap-3 border p-4 ${
                msg.handled
                  ? "border-outline-variant bg-surface-container opacity-60"
                  : "border-outline bg-surface-container"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm text-on-surface">
                    {msg.name}
                    <span className="ml-2 font-mono text-xs text-on-surface-variant">
                      {msg.email}
                    </span>
                  </p>
                  {msg.subject && (
                    <p className="type-label mt-1 text-accent-666">{msg.subject}</p>
                  )}
                </div>
                <span className="type-label text-outline">
                  {formatDate(msg.createdAt)}
                </span>
              </div>

              <p className="whitespace-pre-wrap text-sm text-on-surface-variant">
                {msg.message}
              </p>

              <div className="flex justify-end gap-2">
                {msg.handled ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="type-label"
                    onClick={() => void setHandled(msg, false)}
                  >
                    <Undo2 size={14} /> Buka lagi
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="type-label"
                    onClick={() => void setHandled(msg, true)}
                  >
                    <Check size={14} /> Tandai selesai
                  </Button>
                )}
                <Button
                  variant="destructive"
                  size="icon-sm"
                  onClick={() => void remove(msg)}
                  aria-label={`Hapus pesan dari ${msg.name}`}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
