import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/auth";
import { contentKeySchema, contentUpdateSchema } from "@/lib/validators";
import type { ApiError } from "@/types/api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ key: string }> };

/** Upsert teks section per key — key baru boleh dibuat dari admin. */
export async function PATCH(req: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) {
    return NextResponse.json<ApiError>({ error: "Unauthorized" }, { status: 401 });
  }
  const { key: rawKey } = await params;

  const keyParsed = contentKeySchema.safeParse(rawKey);
  if (!keyParsed.success) {
    return NextResponse.json<ApiError>(
      { error: "Key konten tidak valid" },
      { status: 400 },
    );
  }

  const body: unknown = await req.json().catch(() => null);
  const parsed = contentUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiError>(
      { error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
      { status: 400 },
    );
  }

  const row = await prisma.siteContent.upsert({
    where: { key: keyParsed.data },
    update: { value: parsed.data.value },
    create: { key: keyParsed.data, value: parsed.data.value },
  });
  return NextResponse.json({ key: row.key, value: row.value });
}
