import type { Metadata } from "next";
import { PixelCursorTrail } from "@/components/ui/pixel-trail";

export const metadata: Metadata = {
  title: "Pixel Trail — Demo",
  robots: { index: false },
};

export default function PixelTrailDemoPage() {
  return <PixelCursorTrail />;
}
