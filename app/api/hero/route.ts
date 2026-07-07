import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { HeroMediaDTO } from "@/types/api";

export const dynamic = "force-dynamic";

/** Hero media aktif (BLACK & WHITE) — hover swap garment. */
export async function GET() {
  const rows = await prisma.heroMedia.findMany({
    where: { active: true },
    orderBy: [{ variant: "asc" }, { sort: "asc" }],
    include: { media: { select: { url: true, alt: true } } },
  });

  const dto: HeroMediaDTO[] = rows.map((r) => ({
    id: r.id,
    variant: r.variant,
    url: r.media.url,
    alt: r.media.alt,
  }));
  return NextResponse.json(dto);
}
