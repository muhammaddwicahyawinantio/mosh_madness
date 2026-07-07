import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/auth";
import { messageUpdateSchema } from "@/lib/validators";
import type { ApiError } from "@/types/api";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

/** Tandai handled / batal handled. */
export async function PATCH(req: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) {
    return NextResponse.json<ApiError>({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const body: unknown = await req.json().catch(() => null);
  const parsed = messageUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<ApiError>(
      { error: parsed.error.issues[0]?.message ?? "Input tidak valid" },
      { status: 400 },
    );
  }

  try {
    const row = await prisma.contactMessage.update({
      where: { id },
      data: parsed.data,
    });
    return NextResponse.json({ id: row.id, handled: row.handled });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return NextResponse.json<ApiError>(
        { error: "Pesan tidak ditemukan" },
        { status: 404 },
      );
    }
    throw err;
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  if (!(await requireAdmin())) {
    return NextResponse.json<ApiError>({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const deleted = await prisma.contactMessage.deleteMany({ where: { id } });
  if (deleted.count === 0) {
    return NextResponse.json<ApiError>(
      { error: "Pesan tidak ditemukan" },
      { status: 404 },
    );
  }
  return NextResponse.json({ ok: true });
}
