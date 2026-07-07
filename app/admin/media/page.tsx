import type { Metadata } from "next";
import { MediaClient } from "@/components/admin/MediaClient";

export const metadata: Metadata = { title: "Media" };

export default function AdminMediaPage() {
  return (
    <main>
      <h1 className="type-headline-md mb-6 text-primary">Media</h1>
      <MediaClient />
    </main>
  );
}
