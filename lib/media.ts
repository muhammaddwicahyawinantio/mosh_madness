import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import type { MediaAsset } from "@prisma/client";

/**
 * Direktori penyimpanan upload (BACKEND.md §3).
 * Di Railway WAJIB diarahkan ke mount Volume via env UPLOAD_DIR,
 * kalau tidak file hilang tiap redeploy.
 */
export const UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.join(process.cwd(), "storage", "uploads");

export const MAX_UPLOAD_SIZE = 8 * 1024 * 1024; // 8MB

/** MIME yang boleh di-upload → ekstensi file di storage. */
export const ALLOWED_UPLOAD = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/avif", ".avif"],
]);

/** Simpan file upload ke storage + buat row MediaAsset (url = /media/…). */
export async function saveUpload(file: File, alt: string): Promise<MediaAsset> {
  const ext = ALLOWED_UPLOAD.get(file.type);
  if (!ext) throw new Error(`MIME tidak didukung: ${file.type}`);

  const key = `${new Date().getFullYear()}/${randomUUID()}${ext}`;
  const target = path.join(UPLOAD_DIR, key);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, Buffer.from(await file.arrayBuffer()));

  return prisma.mediaAsset.create({
    data: { key, url: `/media/${key}`, alt, mime: file.type, size: file.size },
  });
}

/**
 * Resolve path file di dalam UPLOAD_DIR — tolak path traversal.
 * Return null kalau hasil resolve keluar dari UPLOAD_DIR.
 */
export function resolveUploadPath(parts: string[]): string | null {
  const resolved = path.resolve(UPLOAD_DIR, parts.join("/"));
  if (!resolved.startsWith(UPLOAD_DIR + path.sep)) return null;
  return resolved;
}

/**
 * Hapus file fisik milik storage. Asset statis (/assets/… di /public,
 * hasil seed) bukan milik storage — di-skip. Best-effort: file yang
 * sudah hilang tidak memblokir penghapusan row DB.
 */
export async function deleteUploadFile(asset: Pick<MediaAsset, "key" | "url">): Promise<void> {
  if (!asset.url.startsWith("/media/")) return;
  const target = resolveUploadPath(asset.key.split("/"));
  if (!target) return;
  await unlink(target).catch(() => undefined);
}

/** Content-Type untuk serve /media berdasarkan ekstensi file. */
export function mimeFromExt(filePath: string): string {
  switch (path.extname(filePath).toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".avif":
      return "image/avif";
    case ".gif":
      return "image/gif";
    case ".mp4":
      return "video/mp4";
    default:
      return "application/octet-stream";
  }
}
