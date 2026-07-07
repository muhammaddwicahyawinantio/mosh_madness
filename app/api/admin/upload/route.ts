import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/auth";
import { ALLOWED_UPLOAD, MAX_UPLOAD_SIZE, saveUpload } from "@/lib/media";
import type { ApiError, MediaAssetDTO } from "@/types/api";

export const dynamic = "force-dynamic";

/** Upload file → storage project + row MediaAsset (BACKEND.md §3/§5). */
export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json<ApiError>({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json<ApiError>(
      { error: "File tidak ditemukan" },
      { status: 400 },
    );
  }
  if (!ALLOWED_UPLOAD.has(file.type)) {
    return NextResponse.json<ApiError>(
      { error: "Format harus JPEG/PNG/WebP/AVIF" },
      { status: 400 },
    );
  }
  if (file.size > MAX_UPLOAD_SIZE) {
    return NextResponse.json<ApiError>({ error: "Maksimal 8MB" }, { status: 400 });
  }

  const altRaw = formData?.get("alt");
  const alt = typeof altRaw === "string" ? altRaw.slice(0, 300) : "";

  const asset = await saveUpload(file, alt);
  return NextResponse.json<MediaAssetDTO>(
    {
      id: asset.id,
      url: asset.url,
      alt: asset.alt,
      mime: asset.mime,
      width: asset.width,
      height: asset.height,
      size: asset.size,
      createdAt: asset.createdAt.toISOString(),
    },
    { status: 201 },
  );
}
