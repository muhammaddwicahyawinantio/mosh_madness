import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ApiError, SiteContentMap } from "@/types/api";

export const dynamic = "force-dynamic";

/** GET /api/content?keys=hero.word,about.writer → { key: value } */
export async function GET(req: NextRequest) {
  const keysParam = req.nextUrl.searchParams.get("keys");
  if (!keysParam) {
    return NextResponse.json<ApiError>(
      { error: "Param ?keys= wajib diisi" },
      { status: 400 },
    );
  }

  const keys = keysParam
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean)
    .slice(0, 50);

  const rows = await prisma.siteContent.findMany({
    where: { key: { in: keys } },
    select: { key: true, value: true },
  });

  const map: SiteContentMap = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return NextResponse.json(map);
}
