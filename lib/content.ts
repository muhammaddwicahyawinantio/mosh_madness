import { prisma } from "@/lib/prisma";

/**
 * Ambil SiteContent per key untuk server component — key yang tidak ada
 * di DB tidak muncul di map (caller wajib sediakan fallback).
 */
export async function getContent(
  keys: string[],
): Promise<Record<string, string>> {
  const rows = await prisma.siteContent.findMany({
    where: { key: { in: keys } },
    select: { key: true, value: true },
  });
  return Object.fromEntries(rows.map((row) => [row.key, row.value]));
}
