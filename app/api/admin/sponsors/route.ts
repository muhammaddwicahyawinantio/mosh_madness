import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/auth";
import { sponsorCreateSchema } from "@/lib/validators";
import type { AdminSponsorDTO, ApiError } from "@/types/api";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json<ApiError>({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.sponsor.findMany({
    orderBy: { sort: "asc" },
    include: { media: { select: { url: true } } },
  });

  const dto: AdminSponsorDTO[] = rows.map((s) => ({
    id: s.id,
    name: s.name,
    mediaId: s.mediaId,
    logoUrl: s.media.url,
    link: s.link,
    sort: s.sort,
    active: s.active,
  }));
  return NextResponse.json(dto);
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json<ApiError>({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await req.json().catch(() => null);
  const parsed = sponsorCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiError>(
      { error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
      { status: 400 },
    );
  }

  const media = await prisma.mediaAsset.findUnique({
    where: { id: parsed.data.mediaId },
    select: { id: true },
  });
  if (!media) {
    return NextResponse.json<ApiError>(
      { error: "Media tidak ditemukan" },
      { status: 404 },
    );
  }

  const row = await prisma.sponsor.create({ data: parsed.data });
  return NextResponse.json(row, { status: 201 });
}
