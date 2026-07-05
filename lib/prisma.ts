import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrisma(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL belum di-set (lihat .env.example)");
  const client = new PrismaClient({
    adapter: new PrismaMariaDb(url),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}

/**
 * Lazy singleton via Proxy — client TIDAK dikonstruksi saat import,
 * hanya saat query pertama. Penting supaya `next build` (collect page data)
 * tidak mencoba inisialisasi DB.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = globalForPrisma.prisma ?? createPrisma();
    return Reflect.get(client, prop, client) as unknown;
  },
});
