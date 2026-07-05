import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/auth";
import type { AnalyticsPoint, AnalyticsSummary } from "@/types/api";

export const dynamic = "force-dynamic";

const DAYS = 30;

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = new Date();
  since.setDate(since.getDate() - (DAYS - 1));
  since.setHours(0, 0, 0, 0);

  const rows = await prisma.$queryRaw<
    Array<{ date: string; views: bigint; visitors: bigint }>
  >`
    SELECT DATE_FORMAT(createdAt, '%Y-%m-%d') AS date,
           COUNT(*)                            AS views,
           COUNT(DISTINCT visitorHash)         AS visitors
    FROM VisitLog
    WHERE createdAt >= ${since}
    GROUP BY DATE_FORMAT(createdAt, '%Y-%m-%d')
    ORDER BY date ASC
  `;

  // Isi tanggal kosong dengan 0 supaya chart tidak bolong
  const byDate = new Map(rows.map((r) => [r.date, r]));
  const series: AnalyticsPoint[] = [];
  for (let i = 0; i < DAYS; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const row = byDate.get(key);
    series.push({
      date: key,
      views: row ? Number(row.views) : 0,
      visitors: row ? Number(row.visitors) : 0,
    });
  }

  const today = new Date().toISOString().slice(0, 10);
  const summary: AnalyticsSummary = {
    totalViews: series.reduce((s, p) => s + p.views, 0),
    totalVisitors: series.reduce((s, p) => s + p.visitors, 0),
    viewsToday: series.find((p) => p.date === today)?.views ?? 0,
    series,
  };

  return NextResponse.json(summary);
}
