import { PrismaClient } from "@prisma/client";

// ---------------------------------------------------------------------------
// Singleton PrismaClient — SATU instance untuk seluruh siklus hidup proses.
//
// Masalah sebelumnya:
//   1. Menggunakan @prisma/adapter-mariadb + PrismaMariaDb padahal schema
//      memakai provider = "mysql" (bukan mariadb). Adapter ini tidak kompatibel
//      → ConnectorError / MysqlError 45028 / pool timeout.
//   2. Singleton hanya disimpan di non-production:
//        if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client
//      Artinya di Railway (NODE_ENV=production) setiap akses Proxy membuat
//      PrismaClient baru → koneksi pool langsung habis → "pool timeout 10 000ms".
//
// Solusi:
//   • Hapus adapter MariaDB — gunakan driver bawaan Prisma untuk MySQL.
//   • Simpan singleton di globalThis untuk SEMUA environment (dev + production).
//   • Lazy init via Proxy agar next build tidak mencoba connect ke DB.
// ---------------------------------------------------------------------------

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;

  if (!url) {
    // Fail fast dengan pesan yang jelas agar mudah di-debug di Railway logs.
    const msg =
      "[prisma] DATABASE_URL belum di-set. " +
      "Pastikan Railway Variable DATABASE_URL sudah terhubung ke service MySQL " +
      "menggunakan private endpoint (MYSQL_URL), bukan localhost.";
    console.error(msg);
    throw new Error(msg);
  }

  console.log(
    "[prisma] Membuat PrismaClient baru — env:",
    process.env.NODE_ENV ?? "unknown",
  );

  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "warn", "error"]
        : ["warn", "error"],
  });
}

/**
 * Lazy singleton via Proxy — PrismaClient TIDAK dikonstruksi saat import,
 * hanya saat query pertama dijalankan. Penting agar `next build` tidak
 * mencoba koneksi DB sebelum container siap.
 *
 * Singleton disimpan di globalThis di SEMUA environment (dev & production)
 * sehingga Next.js App Router tidak membuat koneksi baru setiap request.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    // Buat atau ambil singleton dari global
    if (!global.__prisma) {
      global.__prisma = createPrismaClient();
    }
    const client = global.__prisma;
    return Reflect.get(client, prop, client) as unknown;
  },
});
