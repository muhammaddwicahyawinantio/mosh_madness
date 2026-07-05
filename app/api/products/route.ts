import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ProductDTO } from "@/types/api";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const homeOnly = req.nextUrl.searchParams.get("home") === "true";

  const products = await prisma.product.findMany({
    where: homeOnly ? { showOnHome: true } : undefined,
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      subtitle: true,
      price: true,
      imageUrl: true,
      showOnHome: true,
      sortOrder: true,
    },
  });

  return NextResponse.json<ProductDTO[]>(products);
}
