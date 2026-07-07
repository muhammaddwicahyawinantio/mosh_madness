import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { SponsorDTO } from "@/types/api";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await prisma.sponsor.findMany({
    where: { active: true },
    orderBy: { sort: "asc" },
    include: { media: { select: { url: true } } },
  });

  const dto: SponsorDTO[] = rows.map((s) => ({
    id: s.id,
    name: s.name,
    logoUrl: s.media.url,
    link: s.link,
  }));
  return NextResponse.json(dto);
}
