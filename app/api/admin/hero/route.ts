import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/auth";
import { heroCreateSchema } from "@/lib/validators";
import type { AdminHeroDTO, ApiError } from "@/types/api";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json<ApiError>({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.heroMedia.findMany({
    orderBy: [{ variant: "asc" }, { sort: "asc" }],
    include: { media: { select: { url: true, alt: true } } },
  });

  const dto: AdminHeroDTO[] = rows.map((r) => ({
    id: r.id,
    variant: r.variant,
    mediaId: r.mediaId,
    url: r.media.url,
    alt: r.media.alt,
    sort: r.sort,
    active: r.active,
  }));
  return NextResponse.json(dto);
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json<ApiError>({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await req.json().catch(() => null);
  const parsed = heroCreateSchema.safeParse(body);
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

  const row = await prisma.heroMedia.create({ data: parsed.data });
  return NextResponse.json(row, { status: 201 });
}
