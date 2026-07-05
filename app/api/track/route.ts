import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { trackSchema } from "@/lib/validators";

export const dynamic = "force-dynamic";

/**
 * Hash IP+UA+tanggal → unique visitor per hari tanpa menyimpan IP mentah.
 * AUTH_SECRET dipakai sebagai salt supaya hash tidak bisa di-reverse dari luar.
 */
function visitorHash(req: NextRequest): string {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ua = req.headers.get("user-agent") ?? "unknown";
  const day = new Date().toISOString().slice(0, 10);
  const salt = process.env.AUTH_SECRET ?? "mm-salt";
  return createHash("sha256").update(`${salt}:${ip}:${ua}:${day}`).digest("hex");
}

export async function POST(req: NextRequest) {
  const body: unknown = await req.json().catch(() => null);
  const parsed = trackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Input tidak valid" }, { status: 400 });
  }

  // Jangan tracking area admin
  if (parsed.data.path.startsWith("/admin")) {
    return NextResponse.json({ ok: true });
  }

  await prisma.visitLog.create({
    data: { path: parsed.data.path.slice(0, 255), visitorHash: visitorHash(req) },
  });

  return NextResponse.json({ ok: true });
}
