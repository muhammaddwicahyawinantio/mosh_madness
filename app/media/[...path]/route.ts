import { readFile } from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import { mimeFromExt, resolveUploadPath } from "@/lib/media";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ path: string[] }> };

/** Serve file upload dari storage project (BACKEND.md §3). */
export async function GET(_req: NextRequest, { params }: Params) {
  const { path: parts } = await params;
  const target = resolveUploadPath(parts);
  if (!target) return new NextResponse(null, { status: 400 });

  try {
    const buffer = await readFile(target);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": mimeFromExt(target),
        // Key upload = uuid unik per file → aman cache immutable
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse(null, { status: 404 });
  }
}
