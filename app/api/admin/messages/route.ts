import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/auth";
import type { ApiError, ContactMessageDTO } from "@/types/api";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json<ApiError>({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.contactMessage.findMany({
    orderBy: [{ handled: "asc" }, { createdAt: "desc" }],
  });
  const dto: ContactMessageDTO[] = rows.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    subject: m.subject,
    message: m.message,
    handled: m.handled,
    createdAt: m.createdAt.toISOString(),
  }));
  return NextResponse.json(dto);
}
