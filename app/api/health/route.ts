import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Healthcheck untuk Railway. */
export async function GET() {
  return NextResponse.json({ status: "ok", ts: Date.now() });
}
