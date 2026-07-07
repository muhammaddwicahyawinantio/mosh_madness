import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/auth";
import type { ApiError, SiteContentDTO } from "@/types/api";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json<ApiError>({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.siteContent.findMany({ orderBy: { key: "asc" } });
  const dto: SiteContentDTO[] = rows.map((r) => ({
    key: r.key,
    value: r.value,
    updatedAt: r.updatedAt.toISOString(),
  }));
  return NextResponse.json(dto);
}
