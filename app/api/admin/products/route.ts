import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/auth";
import { productCreateSchema } from "@/lib/validators";
import { adminProductInclude, toAdminProductDTO } from "@/lib/products";
import { slugify } from "@/lib/utils";
import type { ApiError } from "@/types/api";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json<ApiError>({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "asc" },
    include: adminProductInclude,
  });
  return NextResponse.json(products.map(toAdminProductDTO));
}

/** Slug unik: dari input/name, suffix -2, -3, … kalau tabrakan. */
async function uniqueSlug(base: string): Promise<string> {
  const root = base || "produk";
  let candidate = root;
  for (let n = 2; ; n++) {
    const exists = await prisma.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!exists) return candidate;
    candidate = `${root}-${n}`;
  }
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json<ApiError>({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await req.json().catch(() => null);
  const parsed = productCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiError>(
      { error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
      { status: 400 },
    );
  }

  const { slug, ...data } = parsed.data;
  const product = await prisma.product.create({
    data: { ...data, slug: await uniqueSlug(slug ?? slugify(data.name)) },
    include: adminProductInclude,
  });
  return NextResponse.json(toAdminProductDTO(product), { status: 201 });
}
