import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/auth";
import { getImageKit, IMAGEKIT_FOLDER } from "@/lib/imagekit";

export const dynamic = "force-dynamic";

const MAX_SIZE = 8 * 1024 * 1024; // 8MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Format harus JPEG/PNG/WebP/AVIF" },
      { status: 400 },
    );
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Maksimal 8MB" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

  const result = await getImageKit().upload({
    file: buffer,
    fileName: safeName,
    folder: IMAGEKIT_FOLDER,
    useUniqueFileName: true,
  });

  return NextResponse.json({ url: result.url, fileId: result.fileId });
}
