import { NextRequest, NextResponse } from "next/server";
import { getProductDetail } from "@/lib/products";
import type { ApiError } from "@/types/api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { slug } = await params;
  const product = await getProductDetail(slug);
  if (!product) {
    return NextResponse.json<ApiError>(
      { error: "Produk tidak ditemukan" },
      { status: 404 },
    );
  }
  return NextResponse.json(product);
}
