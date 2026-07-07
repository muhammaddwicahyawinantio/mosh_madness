import { NextRequest, NextResponse } from "next/server";
import { getPublishedProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

const flag = (v: string | null) => v === "1" || v === "true";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const products = await getPublishedProducts({
    home: flag(sp.get("home")),
    parallax: flag(sp.get("parallax")),
    category: sp.get("category") ?? undefined,
  });
  return NextResponse.json(products);
}
