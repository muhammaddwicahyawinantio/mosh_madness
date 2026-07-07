import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/auth";
import { productImageCreateSchema } from "@/lib/validators";
import type { AdminProductImageDTO, ApiError } from "@/types/api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** Tambah image ke produk. isPrimary=true → primary lama dilepas (atomic). */
export async function POST(req: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) {
    return NextResponse.json<ApiError>({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: productId } = await params;

  const body: unknown = await req.json().catch(() => null);
  const parsed = productImageCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiError>(
      { error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
      { status: 400 },
    );
  }
  const { mediaId, isPrimary, sort } = parsed.data;

  const [product, media] = await Promise.all([
    prisma.product.findUnique({ where: { id: productId }, select: { id: true } }),
    prisma.mediaAsset.findUnique({ where: { id: mediaId } }),
  ]);
  if (!product) {
    return NextResponse.json<ApiError>(
      { error: "Produk tidak ditemukan" },
      { status: 404 },
    );
  }
  if (!media) {
    return NextResponse.json<ApiError>(
      { error: "Media tidak ditemukan" },
      { status: 404 },
    );
  }

  const image = await prisma.$transaction(async (tx) => {
    if (isPrimary) {
      await tx.productImage.updateMany({
        where: { productId },
        data: { isPrimary: false },
      });
    }
    return tx.productImage.create({
      data: { productId, mediaId, isPrimary, sort },
    });
  });

  return NextResponse.json<AdminProductImageDTO>(
    {
      id: image.id,
      mediaId,
      url: media.url,
      alt: media.alt,
      isPrimary: image.isPrimary,
      sort: image.sort,
    },
    { status: 201 },
  );
}
