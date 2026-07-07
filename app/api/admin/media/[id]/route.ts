import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/auth";
import { mediaUpdateSchema } from "@/lib/validators";
import { deleteUploadFile } from "@/lib/media";
import type { ApiError } from "@/types/api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** Ganti alt text. */
export async function PATCH(req: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) {
    return NextResponse.json<ApiError>({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const body: unknown = await req.json().catch(() => null);
  const parsed = mediaUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiError>(
      { error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
      { status: 400 },
    );
  }

  const updated = await prisma.mediaAsset.updateMany({
    where: { id },
    data: { alt: parsed.data.alt },
  });
  if (updated.count === 0) {
    return NextResponse.json<ApiError>(
      { error: "Media tidak ditemukan" },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true });
}

/** Hapus media: row DB + file fisik. Ditolak kalau masih dipakai. */
export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) {
    return NextResponse.json<ApiError>({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const asset = await prisma.mediaAsset.findUnique({
    where: { id },
    include: {
      _count: { select: { productImages: true, heroMedia: true, sponsors: true } },
    },
  });
  if (!asset) {
    return NextResponse.json<ApiError>(
      { error: "Media tidak ditemukan" },
      { status: 404 },
    );
  }

  const used =
    asset._count.productImages + asset._count.heroMedia + asset._count.sponsors;
  if (used > 0) {
    return NextResponse.json<ApiError>(
      { error: `Media masih dipakai ${used} tempat — lepas dulu sebelum hapus` },
      { status: 409 },
    );
  }

  // Hapus row dulu, baru file — kalau unlink gagal, DB tetap konsisten
  await prisma.mediaAsset.delete({ where: { id } });
  await deleteUploadFile(asset);
  return NextResponse.json({ ok: true });
}
