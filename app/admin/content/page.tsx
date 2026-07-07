import type { Metadata } from "next";
import { ContentClient } from "@/components/admin/ContentClient";

export const metadata: Metadata = { title: "Konten" };

export default function AdminContentPage() {
  return (
    <main>
      <h1 className="type-headline-md mb-6 text-primary">Konten</h1>
      <ContentClient />
    </main>
  );
}
