import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/auth";
import type { ApiError, MediaAssetDTO } from "@/types/api";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json<ApiError>({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.mediaAsset.findMany({
    orderBy: { createdAt: "desc" },
  });
  const dto: MediaAssetDTO[] = rows.map((m) => ({
    id: m.id,
    url: m.url,
    alt: m.alt,
    mime: m.mime,
    width: m.width,
    height: m.height,
    size: m.size,
    createdAt: m.createdAt.toISOString(),
  }));
  return NextResponse.json(dto);
}
