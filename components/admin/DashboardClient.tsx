"use client";

import useSWR from "swr";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { jsonFetcher } from "@/lib/fetcher";
import type { AnalyticsSummary } from "@/types/api";

/**
 * Warna series — keluarga crimson brand, sudah lolos validator dataviz
 * (lightness band dark, chroma, CVD ΔE ≥ 24, kontras ≥ 3:1 vs #201f1f).
 */
const SERIES = {
  views: { label: "Page views", color: "#ea5f52" },
  visitors: { label: "Unique visitors", color: "#b04468" },
} as const;

const AXIS_TICK = {
  fill: "#8e9192",
  fontSize: 11,
  fontFamily: "var(--font-mono)",
} as const;

function shortDate(iso: string): string {
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
}

export function DashboardClient() {
  const { data, error, isLoading } = useSWR<AnalyticsSummary>(
    "/api/admin/analytics",
    jsonFetcher,
    { refreshInterval: 60_000 },
  );

  if (isLoading) {
    return <p className="type-label text-on-surface-variant">Memuat analytics…</p>;
  }
  if (error || !data) {
    return (
      <p role="alert" className="type-label text-error">
        Gagal memuat analytics — cek koneksi database.
      </p>
    );
  }

  const stats = [
    { label: "Views hari ini", value: data.viewsToday },
    { label: "Total views (30 hari)", value: data.totalViews },
    { label: "Unique visitors (30 hari)", value: data.totalVisitors },
  ];
  const lastWeek = data.series.slice(-7).reverse();

  return (
    <div className="flex flex-col gap-6">
      {/* Stat tiles */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-outline-variant bg-surface-container">
            <CardHeader className="pb-2">
              <CardTitle className="type-label font-normal text-on-surface-variant">
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-display text-5xl text-primary">
                {stat.value.toLocaleString("id-ID")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card className="border-outline-variant bg-surface-container">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="type-label font-normal text-on-surface-variant">
            Kunjungan 30 hari terakhir
          </CardTitle>
          {/* Legend — teks pakai token teks, warna hanya di swatch */}
          <div className="flex gap-4">
            {Object.values(SERIES).map((s) => (
              <span key={s.label} className="type-label flex items-center gap-2 text-on-surface-variant">
                <span
                  aria-hidden="true"
                  className="inline-block h-2 w-2"
                  style={{ background: s.color }}
                />
                {s.label}
              </span>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.series} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#353534" />
                <XAxis
                  dataKey="date"
                  tickFormatter={shortDate}
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={{ stroke: "#444748" }}
                  minTickGap={24}
                />
                <YAxis
                  allowDecimals={false}
                  tick={AXIS_TICK}
                  tickLine={false}
                  axisLine={false}
                  width={48}
                />
                <Tooltip
                  cursor={{ stroke: "#444748" }}
                  labelFormatter={(label) => shortDate(String(label))}
                  contentStyle={{
                    background: "#201f1f",
                    border: "1px solid #444748",
                    borderRadius: 0,
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                  }}
                  labelStyle={{ color: "#c4c7c8" }}
                  itemStyle={{ color: "#e5e2e1" }}
                />
                <Line
                  type="monotone"
                  dataKey="views"
                  name={SERIES.views.label}
                  stroke={SERIES.views.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, stroke: "#201f1f", strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="visitors"
                  name={SERIES.visitors.label}
                  stroke={SERIES.visitors.color}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, stroke: "#201f1f", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Table view — akses non-visual + detail angka */}
      <Card className="border-outline-variant bg-surface-container">
        <CardHeader>
          <CardTitle className="type-label font-normal text-on-surface-variant">
            7 hari terakhir
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-outline-variant">
                <TableHead className="type-label">Tanggal</TableHead>
                <TableHead className="type-label text-right">Views</TableHead>
                <TableHead className="type-label text-right">Visitors</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lastWeek.map((point) => (
                <TableRow key={point.date} className="border-outline-variant">
                  <TableCell className="font-mono text-xs">{point.date}</TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {point.views.toLocaleString("id-ID")}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {point.visitors.toLocaleString("id-ID")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
