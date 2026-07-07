import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactCreateSchema } from "@/lib/validators";
import type { ApiError } from "@/types/api";

export const dynamic = "force-dynamic";

/**
 * Rate-limit sederhana per IP di memori — cukup untuk deploy 1 container
 * (BACKEND.md §5). Entri lama ke-filter tiap request dari IP yang sama.
 */
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

/** Terima pesan form kontak → DB (muncul di /admin/messages). */
export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json<ApiError>(
      { error: "Terlalu banyak pesan — coba lagi beberapa menit" },
      { status: 429 },
    );
  }

  const body: unknown = await req.json().catch(() => null);
  const parsed = contactCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiError>(
      { error: "Data form tidak valid" },
      { status: 400 },
    );
  }

  // Honeypot keisi = bot → pura-pura sukses, jangan simpan
  const { website, ...data } = parsed.data;
  if (website) return NextResponse.json({ ok: true }, { status: 201 });

  await prisma.contactMessage.create({ data });
  return NextResponse.json({ ok: true }, { status: 201 });
}
