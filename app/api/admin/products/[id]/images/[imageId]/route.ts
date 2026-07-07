import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/auth";
import { productImageUpdateSchema } from "@/lib/validators";
import type { ApiError } from "@/types/api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string; imageId: string }> };

/** Reorder / set primary. Set primary → primary lama dilepas (atomic). */
export async function PATCH(req: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) {
    return NextResponse.json<ApiError>({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: productId, imageId } = await params;

  const body: unknown = await req.json().catch(() => null);
  const parsed = productImageUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiError>(
      { error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
      { status: 400 },
    );
  }

  const existing = await prisma.productImage.findFirst({
    where: { id: imageId, productId },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json<ApiError>(
      { error: "Image tidak ditemukan" },
      { status: 404 },
    );
  }

  await prisma.$transaction(async (tx) => {
    if (parsed.data.isPrimary) {
      await tx.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });
    }
    await tx.productImage.update({ where: { id: imageId }, data: parsed.data });
  });

  return NextResponse.json({ ok: true });
}

/** Lepas image dari produk — MediaAsset & file tetap di library. */
export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) {
    return NextResponse.json<ApiError>({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: productId, imageId } = await params;

  const deleted = await prisma.productImage.deleteMany({
    where: { id: imageId, productId },
  });
  if (deleted.count === 0) {
    return NextResponse.json<ApiError>(
      { error: "Image tidak ditemukan" },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true });
}
