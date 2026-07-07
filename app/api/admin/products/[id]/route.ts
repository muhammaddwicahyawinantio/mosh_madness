import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/auth";
import { productUpdateSchema } from "@/lib/validators";
import { adminProductInclude, toAdminProductDTO } from "@/lib/products";
import type { ApiError } from "@/types/api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) {
    return NextResponse.json<ApiError>({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: adminProductInclude,
  });
  if (!product) {
    return NextResponse.json<ApiError>(
      { error: "Produk tidak ditemukan" },
      { status: 404 },
    );
  }
  return NextResponse.json(toAdminProductDTO(product));
}

export async function PATCH(req: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) {
    return NextResponse.json<ApiError>({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const body: unknown = await req.json().catch(() => null);
  const parsed = productUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiError>(
      { error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
      { status: 400 },
    );
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data: parsed.data,
      include: adminProductInclude,
    });
    return NextResponse.json(toAdminProductDTO(product));
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2025") {
        return NextResponse.json<ApiError>(
          { error: "Produk tidak ditemukan" },
          { status: 404 },
        );
      }
      if (err.code === "P2002") {
        return NextResponse.json<ApiError>(
          { error: "Slug sudah dipakai produk lain" },
          { status: 409 },
        );
      }
    }
    throw err;
  }
}

/** Hapus produk — row image ikut (cascade), file media tetap di library. */
export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) {
    return NextResponse.json<ApiError>({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  try {
    await prisma.product.delete({ where: { id } });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return NextResponse.json<ApiError>(
        { error: "Produk tidak ditemukan" },
        { status: 404 },
      );
    }
    throw err;
  }
  return NextResponse.json({ ok: true });
}
