import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/auth";
import { productUpdateSchema } from "@/lib/validators";
import { getImageKit } from "@/lib/imagekit";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const body: unknown = await req.json().catch(() => null);
  const parsed = productUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
      { status: 400 },
    );
  }

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
  }

  // Kalau gambar diganti, hapus file lama di ImageKit (best-effort)
  const newFileId = parsed.data.imageFileId;
  if (newFileId && existing.imageFileId && newFileId !== existing.imageFileId) {
    await getImageKit()
      .deleteFile(existing.imageFileId)
      .catch(() => undefined);
  }

  const product = await prisma.product.update({ where: { id }, data: parsed.data });
  return NextResponse.json(product);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Produk tidak ditemukan" }, { status: 404 });
  }

  if (existing.imageFileId) {
    await getImageKit()
      .deleteFile(existing.imageFileId)
      .catch(() => undefined); // file mungkin sudah tidak ada — jangan blokir delete
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
